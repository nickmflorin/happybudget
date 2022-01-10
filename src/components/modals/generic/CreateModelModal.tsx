import { useMemo } from "react";
import { isNil, includes, reduce } from "lodash";

import * as api from "api";
import { ui } from "lib";

import Modal from "./Modal";

export interface CreateModelModalProps<M extends Model.Model, R = M> extends ModalProps {
  readonly onSuccess: (m: R) => void;
}

interface PrivateCreateModelModalProps<M extends Model.Model, P extends Http.PayloadObj, V = P, R = M>
  extends CreateModelModalProps<M, R> {
  readonly form?: FormInstance<V>;
  readonly title?: string | JSX.Element | ((form: FormInstance<V>) => JSX.Element | string);
  readonly autoFocusField?: number;
  readonly create: (payload: P, options: Http.RequestOptions) => Promise<R>;
  readonly children: (form: FormInstance<V>) => JSX.Element;
  readonly interceptPayload?: (p: V) => P;
  /* Conditionally handle the request error.  Returns True if it was handled
     otherwise returns False, which indicates that the default handling should
     be used. */
  readonly interceptError?: (form: FormInstance<V>, e: Error) => boolean;
  readonly convertEmptyStringsToNull?: (keyof P)[] | boolean;
}

const CreateModelModal = <M extends Model.Model, P extends Http.PayloadObj, V = P, R = M>({
  autoFocusField,
  form,
  create,
  onSuccess,
  children,
  interceptPayload,
  interceptError,
  convertEmptyStringsToNull,
  ...props
}: PrivateCreateModelModalProps<M, P, V, R>): JSX.Element => {
  const Form = ui.hooks.useFormIfNotDefined<V>({ isInModal: true, autoFocusField }, form);
  const [cancelToken] = api.useCancelToken();
  const isMounted = ui.hooks.useIsMounted();

  const title = useMemo(() => {
    if (typeof props.title === "function") {
      return props.title(Form);
    } else {
      return props.title;
    }
  }, [props.title]);

  const onOk = useMemo(
    () => () => {
      Form.validateFields()
        .then((values: V) => {
          if (isMounted.current) {
            let payload = (!isNil(interceptPayload) ? interceptPayload(values) : values) as P;
            payload = reduce(
              payload,
              (curr: P, value: P[keyof P], k: string) =>
                ((Array.isArray(convertEmptyStringsToNull) && includes(convertEmptyStringsToNull, k as keyof P)) ||
                  (!Array.isArray(convertEmptyStringsToNull) && convertEmptyStringsToNull !== false)) &&
                value === ("" as unknown as P[keyof P])
                  ? { ...curr, [k]: null }
                  : curr,
              payload
            );
            Form.setLoading(true);
            create(payload, { cancelToken: cancelToken() })
              .then((response: R) => {
                if (isMounted.current) {
                  Form.resetFields();
                  onSuccess(response);
                }
              })
              .catch((e: Error) => {
                if (interceptError?.(Form, e) !== true) {
                  Form.handleRequestError(e);
                }
              })
              .finally(() => {
                if (isMounted.current) {
                  Form.setLoading(false);
                }
              });
          }
        })
        .catch(() => {
          return;
        });
    },
    [Form, create, cancelToken, interceptPayload]
  );

  return (
    <Modal
      {...props}
      okText={"Create"}
      cancelText={"Cancel"}
      title={title}
      okButtonProps={{ disabled: Form.loading }}
      onOk={onOk}
    >
      {children(Form)}
    </Modal>
  );
};

export default CreateModelModal;

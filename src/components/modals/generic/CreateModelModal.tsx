import { useMemo } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { ui } from "lib";

import Modal, { ModalProps } from "./Modal";

type OmitModalProps =
  | "visible"
  | "children"
  | "onCancel"
  | "okText"
  | "cancelText"
  | "okButtonProps"
  | "title"
  | "onOk";

export interface CreateModelModalProps<M extends Model.Model, R = M> extends Omit<ModalProps, OmitModalProps> {
  readonly open: boolean;
  readonly onSuccess: (m: R) => void;
  readonly onCancel: () => void;
}

interface PrivateCreateModelModalProps<M extends Model.Model, P extends Http.ModelPayload<M>, V = P, R = M>
  extends CreateModelModalProps<M, R> {
  readonly form?: FormInstance<V>;
  readonly title?: string | JSX.Element | ((form: FormInstance<V>) => JSX.Element | string);
  readonly autoFocusField?: number;
  readonly create: (payload: P, options: Http.RequestOptions) => Promise<R>;
  readonly children: (form: FormInstance<V>) => JSX.Element;
  readonly interceptPayload?: (p: V) => P;
}

const CreateModelModal = <M extends Model.Model, P extends Http.ModelPayload<M>, V = P, R = M>({
  open,
  autoFocusField,
  form,
  create,
  onSuccess,
  children,
  interceptPayload,
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
            const payload = !isNil(interceptPayload) ? interceptPayload(values) : values;
            Form.setLoading(true);
            create(payload as P, { cancelToken: cancelToken() })
              .then((response: R) => {
                if (isMounted.current) {
                  Form.resetFields();
                  onSuccess(response);
                }
              })
              .catch((e: Error) => {
                Form.handleRequestError(e);
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
      visible={open}
      okText={"Create"}
      cancelText={"Cancel"}
      getContainer={false}
      destroyOnClose={true}
      title={title}
      okButtonProps={{ disabled: Form.loading }}
      onOk={onOk}
    >
      {children(Form)}
    </Modal>
  );
};

export default CreateModelModal;

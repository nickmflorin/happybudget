import { useMemo } from "react";
import { isNil, includes, reduce } from "lodash";

import * as api from "api";
import { ui, hooks } from "lib";

import Modal from "./Modal";

export interface CreateModelModalProps<M extends Model.Model, R = M> extends ModalProps {
  readonly onSuccess: (m: R) => void;
}

export type CreateModelCallbacks<R> = {
  readonly onError: (e: Error) => void;
  readonly onSuccess: (m: R) => void;
};

interface PrivateCreateModelModalProps<
  M extends Model.GenericHttpModel,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>,
  V = P,
  R = M
> extends CreateModelModalProps<M, R> {
  readonly form?: FormInstance<V>;
  readonly title?: string | JSX.Element | ((form: FormInstance<V>) => JSX.Element | string);
  readonly autoFocusField?: number;
  readonly requestOptions?: Omit<Http.RequestOptions, "cancelToken">;
  readonly create?: (payload: P, options: Http.RequestOptions) => Promise<R>;
  /* Used when the async API call should be managed by logic external to this
	   component.  This is typically used when the API call is performed in Sagas,
		 and callbacks need to be provided to the API call performed in those Sagas.
		 */
  readonly createSync?: (payload: P, callbacks: CreateModelCallbacks<R>) => void;
  readonly children: (form: FormInstance<V>) => JSX.Element;
  readonly interceptPayload?: (p: V) => P;
  /* Conditionally handle the request error.  Returns True if it was handled
     otherwise returns False, which indicates that the default handling should
     be used. */
  readonly interceptError?: (form: FormInstance<V>, e: Error) => boolean;
  readonly convertEmptyStringsToNull?: (keyof P)[] | boolean;
}

const CreateModelModal = <
  M extends Model.GenericHttpModel,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>,
  V = P,
  R = M
>({
  autoFocusField,
  form,
  requestOptions,
  create,
  createSync,
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

  const onLoading = hooks.useDynamicCallback((v: boolean) => {
    if (isMounted.current) {
      Form.setLoading(v);
    }
  });

  const title = useMemo(() => {
    if (typeof props.title === "function") {
      return props.title(Form);
    } else {
      return props.title;
    }
  }, [props.title]);

  const _onSuccess = useMemo(
    () => (response: R) => {
      onLoading(false);
      if (isMounted.current) {
        Form.resetFields();
      }
      onSuccess(response);
    },
    [isMounted.current, onSuccess]
  );

  const _onError = useMemo(
    () => (e: Error) => {
      onLoading(false);
      if (interceptError?.(Form, e) !== true) {
        if (isMounted.current) {
          Form.handleRequestError(e);
        }
      }
    },
    [isMounted.current, interceptError]
  );

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
            if (!isNil(create)) {
              onLoading(true);
              create(payload, { ...requestOptions, cancelToken: cancelToken() })
                .then((response: R) => _onSuccess(response))
                .catch((e: Error) => _onError(e));
            } else if (!isNil(createSync)) {
              onLoading(true);
              createSync(payload, { onError: _onError, onSuccess: _onSuccess });
            }
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

import { useMemo, useCallback } from "react";
import { isNil, includes, reduce } from "lodash";

import { ui, hooks, model, http } from "lib";

import Modal from "./Modal";

export interface EditModelModalProps<M extends Model.Model, R = M> extends ModalProps {
  readonly id: number;
  readonly onSuccess: (m: R) => void;
}

export type UpdateModelCallbacks<R> = {
  readonly onError: (e: Error) => void;
  readonly onSuccess: (m: R) => void;
};

interface PrivateEditModelModalProps<
  M extends Model.GenericHttpModel,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>,
  V = P,
  R = M
> extends EditModelModalProps<M, R> {
  readonly form?: FormInstance<V>;
  readonly title?: string | JSX.Element | ((m: M, form: FormInstance<V>) => JSX.Element | string);
  readonly autoFocusField?: number;
  readonly onModelLoaded?: (m: M) => void;
  readonly setFormData: (m: M, form: FormInstance<V>) => void;
  readonly request: (id: number, opts?: Http.RequestOptions) => Promise<M>;
  /* Used when the async API call should be managed by logic external to this
	   component.  This is typically used when the API call is performed in Sagas,
		 and callbacks need to be provided to the API call performed in those Sagas.
		 */
  readonly updateSync?: (payload: P, callbacks: UpdateModelCallbacks<R>) => void;
  readonly update?: (id: number, payload: P, options: Http.RequestOptions) => Promise<R>;
  readonly children: (m: M | null, form: FormInstance<V>) => JSX.Element;
  readonly interceptPayload?: (p: V) => P;
  /* Conditionally handle the request error.  Returns True if it was handled
     otherwise returns False, which indicates that the default handling should
     be used. */
  readonly interceptError?: (form: FormInstance<V>, e: Error) => boolean;
  readonly convertEmptyStringsToNull?: (keyof P)[] | boolean;
}

const EditModelModal = <
  M extends Model.GenericHttpModel,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>,
  V = P,
  R = M
>({
  id,
  autoFocusField,
  form,
  onModelLoaded,
  onSuccess,
  request,
  update,
  updateSync,
  children,
  interceptPayload,
  interceptError,
  setFormData,
  convertEmptyStringsToNull,
  ...props
}: PrivateEditModelModalProps<M, P, V, R>): JSX.Element => {
  const Form = ui.useFormIfNotDefined<V>({ isInModal: true, autoFocusField }, form);
  const [getToken] = http.useCancelToken({ preserve: true, createOnInit: true });
  const isMounted = ui.useIsMounted();

  const onResponse = hooks.useDynamicCallback((m: M) => {
    if (!isNil(m) && props.open === true) {
      setFormData(m, Form);
      onModelLoaded?.(m);
    }
  });

  const onError = hooks.useDynamicCallback((e: Error | null) => {
    if (props.open === true) {
      if (e === null) {
        Form.clearNotifications();
      } else {
        Form.handleRequestError(e);
      }
    }
  });

  const onLoading = hooks.useDynamicCallback((v: boolean) => {
    if (isMounted.current) {
      Form.setLoading(v);
    }
  });

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const [instance, loading, error] = model.useModel<M>(id, {
    request,
    onResponse,
    conditional: () => props.open === true,
    getToken,
    onError,
    onLoading
  });

  const title = useMemo(() => {
    if (typeof props.title === "function") {
      if (!isNil(instance)) {
        return props.title(instance, Form);
      }
      return "";
    } else {
      return props.title;
    }
  }, [instance, props.title]);

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

  const onOk = useCallback(async () => {
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
          if (!isNil(update)) {
            onLoading(true);
            update(id, payload, { cancelToken: getToken() })
              .then((response: R) => _onSuccess(response))
              .catch((e: Error) => _onError(e));
          } else if (!isNil(updateSync)) {
            onLoading(true);
            updateSync(payload, { onSuccess: _onSuccess, onError: _onError });
          }
        }
      })
      .catch(() => {
        return;
      });
  }, [Form, update, getToken, interceptPayload]);

  return (
    <Modal
      {...props}
      okText={"Save"}
      cancelText={"Cancel"}
      title={title}
      okButtonProps={{ disabled: Form.loading }}
      onOk={onOk}
    >
      {children(instance, Form)}
    </Modal>
  );
};

export default EditModelModal;

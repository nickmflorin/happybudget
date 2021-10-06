import { useEffect, useMemo, useImperativeHandle, forwardRef, ForwardedRef } from "react";
import { isNil } from "lodash";

import { model } from "lib";
import * as api from "api";
import { Form } from "components";

import Modal, { ModalProps } from "./Modal";

export interface EditModelModalProps<M extends Model.Model, P extends Http.ModelPayload<M>, R = M>
  extends Omit<ModalProps, "children"> {
  readonly id: number;
  readonly open: boolean;
  readonly onUpdate?: (values: P) => void;
  readonly onSuccess: (m: R) => void;
  readonly onCancel: () => void;
}

interface PrivateEditModelModalProps<M extends Model.Model, P extends Http.ModelPayload<M>, V = P, R = M>
  extends EditModelModalProps<M, P, R> {
  readonly title?: string | JSX.Element | ((m: M, form: FormInstance<V>) => JSX.Element | string);
  readonly autoFocusField?: number;
  readonly onModelLoaded?: (m: M) => void;
  readonly setFormData: (m: M, form: FormInstance<V>) => void;
  readonly request: (id: number) => Promise<M>;
  readonly update?: (id: number, payload: P, options: Http.RequestOptions) => Promise<R>;
  readonly children: (m: M | null, form: FormInstance<V>) => JSX.Element;
  readonly interceptPayload?: (p: V) => P;
}

const EditModelModal = <M extends Model.Model, P extends Http.ModelPayload<M>, V = P, R = M>(
  {
    id,
    open,
    autoFocusField,
    onModelLoaded,
    onSuccess,
    onCancel,
    request,
    update,
    onUpdate,
    children,
    interceptPayload,
    setFormData,
    ...props
  }: PrivateEditModelModalProps<M, P, V, R>,
  ref: ForwardedRef<FormInstance<V>>
): JSX.Element => {
  const [form] = Form.useForm<V>({ isInModal: true, autoFocusField });
  const cancelToken = api.useCancelToken();
  const [instance, loading, error] = model.hooks.useModel(id, {
    request,
    onModelLoaded,
    conditional: () => open === true,
    deps: [open]
  });

  useEffect(() => {
    form.setLoading(loading);
  }, [loading]);

  useEffect(() => {
    if (!isNil(error)) {
      form.setGlobalError(error);
    }
  }, [error]);

  useEffect(() => {
    if (!isNil(instance)) {
      setFormData(instance, form);
    }
  }, [instance]);

  const title = useMemo(() => {
    if (typeof props.title === "function") {
      if (!isNil(instance)) {
        return props.title(instance, form);
      }
      return "";
    } else {
      return props.title;
    }
  }, [instance]);

  useImperativeHandle(ref, () => ({
    ...form
  }));

  return (
    <Modal
      {...props}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Save"}
      cancelText={"Cancel"}
      getContainer={false}
      title={title}
      okButtonProps={{ disabled: form.loading || loading }}
      onOk={() => {
        form
          .validateFields()
          .then((values: V) => {
            const payload = !isNil(interceptPayload) ? interceptPayload(values) : values;
            onUpdate?.(payload as P);
            if (!isNil(update) && isNil(onUpdate)) {
              form.setLoading(true);
              update(id, payload as P, { cancelToken: cancelToken() })
                .then((response: R) => {
                  form.resetFields();
                  onSuccess(response);
                })
                .catch((e: Error) => {
                  form.handleRequestError(e);
                })
                .finally(() => {
                  form.setLoading(false);
                });
            }
          })
          .catch(() => {
            return;
          });
      }}
    >
      {children(instance, form)}
    </Modal>
  );
};

export default forwardRef(EditModelModal) as typeof EditModelModal;

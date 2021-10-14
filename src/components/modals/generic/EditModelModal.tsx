import { useEffect, useMemo } from "react";
import { isNil } from "lodash";

import { model, ui } from "lib";
import * as api from "api";

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

export interface EditModelModalProps<M extends Model.Model, R = M> extends Omit<ModalProps, OmitModalProps> {
  readonly id: number;
  readonly open: boolean;
  readonly onSuccess: (m: R) => void;
  readonly onCancel: () => void;
}

interface PrivateEditModelModalProps<M extends Model.Model, P extends Http.ModelPayload<M>, V = P, R = M>
  extends EditModelModalProps<M, R> {
  readonly form?: FormInstance<V>;
  readonly title?: string | JSX.Element | ((m: M, form: FormInstance<V>) => JSX.Element | string);
  readonly autoFocusField?: number;
  readonly onModelLoaded?: (m: M) => void;
  readonly setFormData: (m: M, form: FormInstance<V>) => void;
  readonly request: (id: number) => Promise<M>;
  readonly update: (id: number, payload: P, options: Http.RequestOptions) => Promise<R>;
  readonly children: (m: M | null, form: FormInstance<V>) => JSX.Element;
  readonly interceptPayload?: (p: V) => P;
}

const EditModelModal = <M extends Model.Model, P extends Http.ModelPayload<M>, V = P, R = M>({
  id,
  open,
  autoFocusField,
  form,
  onModelLoaded,
  onSuccess,
  onCancel,
  request,
  update,
  children,
  interceptPayload,
  setFormData,
  ...props
}: PrivateEditModelModalProps<M, P, V, R>): JSX.Element => {
  const Form = ui.hooks.useFormIfNotDefined<V>({ isInModal: true, autoFocusField }, form);
  const [cancelToken, cancel] = api.useCancelToken();
  const [instance, loading, error] = model.hooks.useModel(id, {
    request,
    onModelLoaded,
    conditional: () => open === true,
    deps: [open],
    cancelToken: cancelToken()
  });

  useEffect(() => {
    if (open === true) {
      Form.setLoading(loading);
    }
  }, [loading, open]);

  useEffect(() => {
    if (!isNil(error) && open === true) {
      Form.setGlobalError(error);
    }
  }, [error, open]);

  useEffect(() => {
    if (!isNil(instance) && open === true) {
      setFormData(instance, Form);
    }
  }, [instance, open]);

  useEffect(() => {
    if (open === false) {
      cancel?.();
    }
  }, [open, cancel]);

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

  const onOk = useMemo(
    () => () => {
      Form.validateFields()
        .then((values: V) => {
          const payload = !isNil(interceptPayload) ? interceptPayload(values) : values;
          Form.setLoading(true);
          update(id, payload as P, { cancelToken: cancelToken() })
            .then((response: R) => {
              Form.resetFields();
              cancel?.();
              onSuccess(response);
            })
            .catch((e: Error) => {
              Form.handleRequestError(e);
            })
            .finally(() => {
              Form.setLoading(false);
            });
        })
        .catch(() => {
          return;
        });
    },
    [Form, update, cancelToken, cancel, interceptPayload]
  );

  return (
    <Modal
      {...props}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Save"}
      cancelText={"Cancel"}
      getContainer={false}
      title={title}
      okButtonProps={{ disabled: Form.loading || loading }}
      onOk={onOk}
    >
      {children(instance, Form)}
    </Modal>
  );
};

export default EditModelModal;

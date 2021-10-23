import { useEffect, useMemo, useCallback } from "react";
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
  const [getToken] = api.useCancelToken({ preserve: true, createOnInit: true });
  const isMounted = ui.hooks.useIsMounted();
  const [instance, loading, error] = model.hooks.useModel(id, {
    request,
    onModelLoaded,
    conditional: () => open === true,
    deps: [open],
    getToken
  });

  useEffect(() => {
    if (open === true) {
      Form.setLoading(loading);
    }
  }, [loading]);

  useEffect(() => {
    if (!isNil(error) && open === true) {
      Form.handleRequestError(error);
    }
  }, [error, open]);

  useEffect(() => {
    if (!isNil(instance) && open === true) {
      setFormData(instance, Form);
    }
  }, [instance, open]);

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

  const onOk = useCallback(async () => {
    Form.validateFields()
      .then((values: V) => {
        if (isMounted.current) {
          const payload = !isNil(interceptPayload) ? interceptPayload(values) : values;
          Form.setLoading(true);
          update(id, payload as P, { cancelToken: getToken() })
            .then((response: R) => {
              if (isMounted.current) {
                Form.resetFields();
              }
              onSuccess(response);
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
  }, [Form, update, getToken, interceptPayload]);

  return (
    <Modal
      {...props}
      visible={open}
      destroyOnClose={true}
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

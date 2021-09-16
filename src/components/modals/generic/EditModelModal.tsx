import { useEffect, useMemo } from "react";
import { isNil } from "lodash";

import { model } from "lib";
import * as api from "api";
import { Form } from "components";

import Modal, { ModalProps } from "./Modal";

export interface EditModelModalProps<M extends Model.Model> extends Omit<ModalProps, "children"> {
  readonly id: number;
  readonly open: boolean;
  readonly onSuccess: (m: M) => void;
  readonly onCancel: () => void;
}

interface PrivateEditModelModalProps<M extends Model.Model, P> extends EditModelModalProps<M> {
  readonly title?: string | JSX.Element | ((m: M, form: FormInstance<P>) => JSX.Element | string);
  readonly autoFocusField?: number;
  readonly setFormData: (m: M, form: FormInstance<P>) => void;
  readonly request: (id: number) => Promise<M>;
  readonly update: (id: number, payload: P, options: Http.RequestOptions) => Promise<M>;
  readonly children: (form: FormInstance<P>) => JSX.Element;
  readonly interceptPayload?: (p: P) => P;
}

const EditModelModal = <M extends Model.Model, P>({
  id,
  open,
  autoFocusField,
  onSuccess,
  onCancel,
  request,
  update,
  children,
  interceptPayload,
  setFormData,
  ...props
}: PrivateEditModelModalProps<M, P>): JSX.Element => {
  const [form] = Form.useForm<P>({ isInModal: true, autoFocusField });
  const cancelToken = api.useCancelToken();
  const [instance, loading, error] = model.hooks.useModel(id, {
    request,
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
          .then((values: P) => {
            const payload = !isNil(interceptPayload) ? interceptPayload(values) : values;
            form.setLoading(true);
            update(id, payload, { cancelToken: cancelToken() })
              .then((response: M) => {
                form.resetFields();
                onSuccess(response);
              })
              .catch((e: Error) => {
                form.handleRequestError(e);
              })
              .finally(() => {
                form.setLoading(false);
              });
          })
          .catch(() => {
            return;
          });
      }}
    >
      {children(form)}
    </Modal>
  );
};

export default EditModelModal;

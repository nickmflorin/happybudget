import { useState } from "react";
import { isNil } from "lodash";

import { createTemplate } from "api/services";
import { getBase64 } from "lib/util/files";
import { Form } from "components";
import { TemplateForm } from "components/forms";
import { TemplateFormValues } from "components/forms/TemplateForm";

import Modal from "./Modal";

interface CreateTemplateModalProps {
  onSuccess: (template: Model.Template) => void;
  onCancel: () => void;
  open: boolean;
}

const CreateTemplateModal = ({ open, onSuccess, onCancel }: CreateTemplateModalProps): JSX.Element => {
  const [file, setFile] = useState<File | Blob | null>(null);
  const [form] = Form.useForm();

  return (
    <Modal
      title={"Create Template"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: TemplateFormValues) => {
            const submit = (payload: Http.TemplatePayload) => {
              createTemplate(payload)
                .then((template: Model.Template) => {
                  form.resetFields();
                  onSuccess(template);
                })
                .catch((e: Error) => {
                  form.handleRequestError(e);
                })
                .finally(() => {
                  form.setLoading(false);
                });
            };
            if (!isNil(file)) {
              getBase64(file, (result: ArrayBuffer | string | null) => {
                if (result !== null) {
                  submit({ ...values, image: result });
                }
              });
            } else {
              submit(values);
            }
          })
          .catch(() => {
            return;
          });
      }}
    >
      <TemplateForm
        form={form}
        onImageChange={(f: File | Blob) => setFile(f)}
        name={"form_in_modal"}
        initialValues={{}}
      />
    </Modal>
  );
};

export default CreateTemplateModal;

import { useState } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { getBase64 } from "lib/util/files";
import { Form } from "components";
import { TemplateForm } from "components/forms";
import { useLoggedInUser } from "store/hooks";

import Modal from "./Modal";

interface CreateTemplateModalProps {
  onSuccess: (template: Model.Template) => void;
  onCancel: () => void;
  community?: boolean;
  open: boolean;
}

const CreateTemplateModal = ({
  open,
  community = false,
  onSuccess,
  onCancel
}: CreateTemplateModalProps): JSX.Element => {
  const user = useLoggedInUser();
  const [file, setFile] = useState<File | Blob | null>(null);
  const [form] = Form.useForm<Http.TemplatePayload>({ isInModal: true });

  return (
    <Modal
      title={"Create Template"}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      okButtonProps={{ disabled: form.loading }}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.TemplatePayload) => {
            let service = api.createTemplate;
            if (community === true && user.is_staff === true) {
              service = api.createCommunityTemplate;
            }
            const submit = (payload: Http.TemplatePayload) => {
              form.setLoading(true);
              service(payload)
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
      <TemplateForm form={form} onImageChange={(f: File | Blob) => setFile(f)} initialValues={{}} />
    </Modal>
  );
};

export default CreateTemplateModal;

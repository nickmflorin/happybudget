import { useState, useEffect } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { Form } from "components";
import { BudgetForm } from "components/forms";

import Modal from "./Modal";

interface CreateBudgetModalProps {
  onSuccess: (budget: Model.Budget) => void;
  onCancel: () => void;
  open: boolean;
  templateId?: number;
  templates?: Model.Template[];
  templatesLoading?: boolean;
  allowTemplateSelection?: boolean;
  title?: string;
}

const CreateBudgetModal = ({
  open,
  templateId,
  templates,
  templatesLoading,
  allowTemplateSelection = true,
  title = "Create Budget",
  onSuccess,
  onCancel
}: CreateBudgetModalProps): JSX.Element => {
  const [_templatesLoading, setTemplatesLoading] = useState(false);
  const [_templates, setTemplates] = useState<Model.SimpleTemplate[]>([]);

  const [file, setFile] = useState<UploadedImage | null>(null);
  const [form] = Form.useForm<Http.BudgetPayload>({ isInModal: true });

  useEffect(() => {
    if (allowTemplateSelection === true && isNil(templates) && isNil(templateId)) {
      setTemplatesLoading(true);
      api
        .getTemplates({ no_pagination: true })
        .then((response: Http.ListResponse<Model.SimpleTemplate>) => {
          setTemplates(response.data);
        })
        .catch((e: Error) => {
          form.handleRequestError(e);
        })
        .finally(() => {
          setTemplatesLoading(false);
        });
    }
  }, [allowTemplateSelection, templates]);

  return (
    <Modal.Modal
      title={title}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      okButtonProps={{ disabled: form.loading }}
      cancelText={"Cancel"}
      getContainer={false}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.BudgetPayload) => {
            if (!isNil(templateId)) {
              values = { ...values, template: templateId };
            }
            form.setLoading(true);
            api
              .createBudget({ ...values, image: !isNil(file) ? file.data : null })
              .then((budget: Model.Budget) => {
                form.resetFields();
                onSuccess(budget);
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
      <BudgetForm
        form={form}
        onImageChange={(f: UploadedImage | null) => setFile(f)}
        templatesLoading={templatesLoading !== undefined ? templatesLoading : _templatesLoading}
        templates={
          allowTemplateSelection === true && isNil(templateId)
            ? templates !== undefined
              ? templates
              : _templates
            : undefined
        }
        initialValues={{}}
      />
    </Modal.Modal>
  );
};

export default CreateBudgetModal;

import { useState, useEffect } from "react";
import { isNil } from "lodash";

import { createBudget, getTemplates } from "api/services";
import { getBase64 } from "lib/util/files";
import { Form } from "components";
import { BudgetForm } from "components/forms";
import { BudgetFormValues } from "components/forms/BudgetForm";

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
  const [_templates, setTemplates] = useState<Model.Template[]>([]);

  const [file, setFile] = useState<File | Blob | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (allowTemplateSelection === true && isNil(templates) && isNil(templateId)) {
      setTemplatesLoading(true);
      getTemplates({ no_pagination: true })
        .then((response: Http.ListResponse<Model.Template>) => {
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
    <Modal
      title={title}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: BudgetFormValues) => {
            const submit = (payload: Http.BudgetPayload) => {
              if (!isNil(templateId)) {
                payload = { ...payload, template: templateId };
              }
              createBudget(payload)
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
      <BudgetForm
        form={form}
        onImageChange={(f: File | Blob) => setFile(f)}
        templatesLoading={templatesLoading !== undefined ? templatesLoading : _templatesLoading}
        templates={
          allowTemplateSelection === true && isNil(templateId)
            ? templates !== undefined
              ? templates
              : _templates
            : undefined
        }
        name={"form_in_modal"}
        initialValues={{}}
      />
    </Modal>
  );
};

export default CreateBudgetModal;

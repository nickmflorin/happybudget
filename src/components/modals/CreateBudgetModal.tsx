import { useState, useEffect } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { getBase64 } from "lib/util/files";
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

  const [file, setFile] = useState<File | Blob | null>(null);
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
    <Modal
      title={title}
      visible={open}
      onCancel={() => onCancel()}
      okText={"Create"}
      okButtonProps={{ disabled: form.loading }}
      cancelText={"Cancel"}
      onOk={() => {
        form
          .validateFields()
          .then((values: Http.BudgetPayload) => {
            const submit = (payload: Http.BudgetPayload) => {
              if (!isNil(templateId)) {
                payload = { ...payload, template: templateId };
              }
              form.setLoading(true);
              api
                .createBudget(payload)
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
              getBase64(file)
                .then((result: ArrayBuffer | string) => submit({ ...values, image: result }))
                .catch((e: Error) => {
                  /* eslint-disable no-console */
                  console.error(e);
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
        onImageChange={(f: File | Blob | null) => setFile(f)}
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
    </Modal>
  );
};

export default CreateBudgetModal;

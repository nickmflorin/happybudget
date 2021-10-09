import { useState } from "react";
import { isNil } from "lodash";

import * as api from "api";
import { TemplateForm } from "components/forms";
import { CreateModelModal, CreateModelModalProps } from "./generic";

interface CreateBudgetModalProps extends CreateModelModalProps<Model.Budget> {
  readonly templateId?: number;
  readonly title?: string;
}

const CreateBudgetModal = ({ templateId, ...props }: CreateBudgetModalProps): JSX.Element => {
  const [file, setFile] = useState<UploadedImage | null>(null);

  return (
    <CreateModelModal<Model.Budget, Http.BudgetPayload>
      title={"Create Budget"}
      {...props}
      create={api.createBudget}
      interceptPayload={(p: Http.BudgetPayload) => {
        if (!isNil(templateId)) {
          p = { ...p, template: templateId };
        }
        return { ...p, image: !isNil(file) ? file.data : null };
      }}
    >
      {(form: FormInstance<Http.BudgetPayload>) => (
        <TemplateForm form={form} onImageChange={(f: UploadedImage | null) => setFile(f)} initialValues={{}} />
      )}
    </CreateModelModal>
  );
};

export default CreateBudgetModal;

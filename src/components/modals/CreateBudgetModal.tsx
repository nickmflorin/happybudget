import { useState } from "react";
import { useHistory } from "react-router-dom";
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
  const history = useHistory();

  return (
    <CreateModelModal<Model.Budget, Http.BudgetPayload>
      title={"Create Budget"}
      {...props}
      create={api.createBudget}
      interceptError={(f: FormInstance<Http.BudgetPayload>, e: Error) => {
        if (
          e instanceof api.ClientError &&
          !isNil(e.permissionError) &&
          e.permissionError.code === "subscription_permission_error"
        ) {
          f.notify({
            message: "Subscription Error",
            detail: "You are not subscribed to the correct products to create an additional budget.",
            includeLink: () => ({
              text: "Click here to subscribe.",
              onClick: () => history.push("/billing")
            })
          });
          return true;
        }
        return false;
      }}
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

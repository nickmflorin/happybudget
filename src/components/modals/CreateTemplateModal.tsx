import { useState } from "react";

import { isNil } from "lodash";

import * as api from "api";
import * as store from "store";
import { TemplateForm } from "components/forms";

import { CreateModelModal, CreateModelModalProps } from "./generic";

interface CreateTemplateModalProps extends CreateModelModalProps<Model.Template> {
  readonly community?: boolean;
}

const CreateTemplateModal = ({
  community = false,
  ...props
}: CreateTemplateModalProps): JSX.Element => {
  const [user, _] = store.hooks.useLoggedInUser();
  const [file, setFile] = useState<UploadedImage | null>(null);

  return (
    <CreateModelModal<Model.Template, Http.TemplatePayload>
      {...props}
      title="Create Template"
      create={
        community === true && user.is_staff === true
          ? api.createCommunityTemplate
          : api.createTemplate
      }
      interceptPayload={(p: Http.TemplatePayload) => ({
        ...p,
        image: !isNil(file) ? file.data : null,
      })}
    >
      {(form: FormInstance<Http.TemplatePayload>) => (
        <TemplateForm
          form={form}
          onImageChange={(f: UploadedImage | null) => setFile(f)}
          initialValues={{}}
        />
      )}
    </CreateModelModal>
  );
};

export default CreateTemplateModal;

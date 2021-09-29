import * as api from "api";

import { MarkupForm } from "components/forms";

import { EditModelModal, EditModelModalProps } from "./generic";

const EditMarkupModal = (props: EditModelModalProps<Model.Markup>): JSX.Element => {
  return (
    <EditModelModal<Model.Markup, Http.MarkupPayload>
      {...props}
      title={"Markup"}
      request={api.getMarkup}
      update={api.updateMarkup}
      setFormData={(markup: Model.Markup, form: FormInstance<Http.MarkupPayload>) =>
        form.setFields([
          { name: "identifier", value: markup.identifier },
          { name: "description", value: markup.description },
          { name: "unit", value: markup.unit?.id || null },
          { name: "rate", value: markup.rate }
        ])
      }
    >
      {(m: Model.Markup | null, form: FormInstance<Http.MarkupPayload>) => (
        <MarkupForm form={form} availableChildren={[]} availableChildrenLoading={false} />
      )}
    </EditModelModal>
  );
};

export default EditMarkupModal;

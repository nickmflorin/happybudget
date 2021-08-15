import { forwardRef } from "react";
import { model } from "lib";
import { framework } from "components/tabling/generic";
import { ChoiceEditor } from "components/tabling/generic/framework/editors";

const ContactTypeEditor = (
  props: Omit<
    framework.editors.ChoiceEditorProps<Tables.ContactRow, Model.Contact, Model.ContactType>,
    "models" | "searchIndices"
  >,
  ref: any
) => {
  return (
    <ChoiceEditor<Tables.ContactRow, Model.Contact, Model.ContactType>
      searchIndices={["name"]}
      models={model.models.ContactTypes}
      forwardedRef={ref}
      {...props}
    />
  );
};

export default forwardRef(ContactTypeEditor);

import { forwardRef, ForwardedRef } from "react";
import { models } from "lib";
import { framework } from "components/tabling/generic";
import { ChoiceSelectEditor } from "components/tabling/generic/framework/editors";

const ContactTypeEditor = (
  props: Omit<
    framework.editors.ChoiceSelectEditorProps<
      Model.ContactType,
      Tables.ContactRowData,
      Model.Contact,
      Tables.ContactTableStore
    >,
    "models" | "searchIndices"
  >,
  ref: ForwardedRef<any>
) => {
  return (
    <ChoiceSelectEditor<Model.ContactType, Tables.ContactRowData, Model.Contact, Tables.ContactTableStore>
      searchIndices={["name"]}
      models={models.ContactTypes}
      ref={ref}
      {...props}
    />
  );
};

export default forwardRef(ContactTypeEditor);

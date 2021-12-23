import { forwardRef, ForwardedRef } from "react";
import { models } from "lib";
import { framework } from "tabling/generic";
import { ChoiceSelectEditor } from "tabling/generic/framework/editors";

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
  ref: ForwardedRef<Table.AgEditorRef<Model.ContactType>>
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

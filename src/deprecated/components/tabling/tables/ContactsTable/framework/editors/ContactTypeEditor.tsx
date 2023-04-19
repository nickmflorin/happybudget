import { forwardRef, ForwardedRef } from "react";

import { model } from "lib";
import { framework } from "deprecated/components/tabling/generic";
import { ChoiceSelectEditor } from "deprecated/components/tabling/generic/framework/editors";

const ContactTypeEditor = (
  props: Omit<
    framework.editors.ChoiceSelectEditorProps<
      Model.ContactType,
      Tables.ContactRowData,
      Model.Contact,
      Table.Context,
      Tables.ContactTableStore
    >,
    "models" | "searchIndices"
  >,
  ref: ForwardedRef<Table.AgEditorRef<Model.ContactType>>,
) => (
  <ChoiceSelectEditor<
    Model.ContactType,
    Tables.ContactRowData,
    Model.Contact,
    Table.Context,
    Tables.ContactTableStore
  >
    searchIndices={["name"]}
    models={model.contact.ContactTypes.choices}
    ref={ref}
    {...props}
  />
);

export default forwardRef(ContactTypeEditor);

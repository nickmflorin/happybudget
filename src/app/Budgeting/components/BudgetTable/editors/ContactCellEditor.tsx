import { forwardRef } from "react";

import { useContacts } from "store/hooks";
import useModelMenuEditor from "./ModelMenuEditor";
import ExpandedModelTagCellEditor from "./ExpandedModelTagCellEditor";

const ContactCellEditor = (props: Table.CellEditorParams, ref: any) => {
  const contacts = useContacts();
  const [editor] = useModelMenuEditor<Model.Contact, number>({ ...props, forwardedRef: ref });

  return (
    <ExpandedModelTagCellEditor<Model.Contact, number>
      editor={editor}
      style={{ width: 120 }}
      selected={editor.value}
      menuRef={editor.menuRef}
      models={contacts}
      onChange={(m: Model.Contact, e: Table.CellDoneEditingEvent) => editor.onChange(m.id, e)}
      searchIndices={["first_name", "last_name"]}
      tagProps={{ color: "#EFEFEF", textColor: "#2182e4", modelTextField: "full_name" }}
    />
  );
};

export default forwardRef(ContactCellEditor);

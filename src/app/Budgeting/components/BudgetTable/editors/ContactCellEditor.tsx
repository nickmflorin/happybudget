import { forwardRef } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-light-svg-icons";

import { useContacts } from "store/hooks";
import useModelMenuEditor from "./ModelMenuEditor";
import ExpandedModelTagCellEditor from "./ExpandedModelTagCellEditor";
import { isNil } from "lodash";

interface ContactCellEditorProps extends Table.CellEditorParams {
  readonly onNewContact: (name?: string) => void;
}

const ContactCellEditor = (props: ContactCellEditorProps, ref: any) => {
  const contacts = useContacts();
  const [editor] = useModelMenuEditor<Model.Contact, number>({ ...props, forwardedRef: ref });

  return (
    <ExpandedModelTagCellEditor<Model.Contact, number>
      editor={editor}
      style={{ width: 160 }}
      selected={editor.value}
      menuRef={editor.menuRef}
      models={contacts}
      onChange={(m: Model.Contact, e: Table.CellDoneEditingEvent) => editor.onChange(m.id, e)}
      searchIndices={["first_name", "last_name"]}
      tagProps={{ color: "#EFEFEF", textColor: "#2182e4", modelTextField: "full_name", className: "tag--contact" }}
      extra={[
        {
          onClick: () => {
            if (!isNil(editor.menuRef.current) && editor.menuRef.current.searchValue !== "") {
              props.onNewContact(editor.menuRef.current.searchValue);
            } else {
              props.onNewContact();
            }
          },
          text: "Add Contact",
          icon: <FontAwesomeIcon className={"icon"} icon={faPlus} />,
          showOnNoSearchResults: true,
          showOnNoData: true,
          focusOnNoSearchResults: true,
          focusOnNoData: true,
          leaveAtBottom: true
        }
      ]}
    />
  );
};

export default forwardRef(ContactCellEditor);

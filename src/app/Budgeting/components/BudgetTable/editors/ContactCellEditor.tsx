import { forwardRef } from "react";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-light-svg-icons";

import { useContacts } from "store/hooks";
import useModelMenuEditor from "./ModelMenuEditor";
import ExpandedModelTagCellEditor from "./ExpandedModelTagCellEditor";

interface ContactCellEditorProps extends Table.CellEditorParams<BudgetTable.SubAccountRow, Model.SubAccount> {
  readonly onNewContact: (params: {
    name?: string;
    change: Omit<Table.CellChange<BudgetTable.SubAccountRow, Model.SubAccount>, "newValue">;
  }) => void;
}

const ContactCellEditor = (props: ContactCellEditorProps, ref: any) => {
  const contacts = useContacts();
  const [editor] = useModelMenuEditor<BudgetTable.SubAccountRow, Model.SubAccount, Model.Contact, number>({
    ...props,
    forwardedRef: ref
  });

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
            const row: BudgetTable.SubAccountRow = props.node.data;
            if (!isNil(editor.menuRef.current) && editor.menuRef.current.searchValue !== "") {
              props.onNewContact({
                name: editor.menuRef.current.searchValue,
                change: {
                  oldValue: row.contact || null,
                  field: props.column.field,
                  row,
                  column: props.column,
                  id: row.id
                }
              });
            } else {
              props.onNewContact({
                change: {
                  oldValue: row.contact || null,
                  field: props.column.field,
                  row,
                  column: props.column,
                  id: row.id
                }
              });
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

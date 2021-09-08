import { forwardRef } from "react";

import { useContacts } from "store/hooks";
import { Icon } from "components";
import { framework } from "components/tabling/generic";

import { ModelTagEditor } from "./generic";

interface ContactEditorProps<R extends Table.Row, M extends Model.Model>
  extends Table.EditorParams<R, M, Model.Contact> {
  readonly onNewContact: (params: { name?: string; change: Omit<Table.CellChange<R, M>, "newValue"> }) => void;
}

const ContactEditor = <R extends Table.Row, M extends Model.Model>(props: ContactEditorProps<R, M>, ref: any) => {
  const contacts = useContacts();

  const [editor] = framework.editors.useModelMenuEditor<R, M, Model.Contact, number>({
    ...props,
    forwardedRef: ref
  });

  return (
    <ModelTagEditor<R, M, Model.Contact, number>
      editor={editor}
      style={{ width: 160 }}
      selected={editor.value}
      models={contacts}
      onChange={(e: MenuChangeEvent<Model.Contact>) => editor.onChange(e.model.id, e.event)}
      searchIndices={["first_name", "last_name"]}
      tagProps={{ color: "#F5F5F5", textColor: "#2182e4", modelTextField: "full_name", className: "tag--contact" }}
      extra={[
        {
          id: "add-contact",
          onClick: () => {
            const row: R = props.node.data;
            const searchValue = editor.menu.current.getSearchValue();
            editor.stopEditing(false);
            if (searchValue !== "") {
              props.onNewContact({
                name: searchValue,
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
          label: "Add Contact",
          icon: <Icon icon={"plus-circle"} weight={"solid"} green={true} />,
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

export default forwardRef(ContactEditor);

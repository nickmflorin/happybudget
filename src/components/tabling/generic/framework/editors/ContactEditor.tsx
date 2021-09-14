import { forwardRef, ForwardedRef } from "react";
import { filter } from "lodash";

import { tabling } from "lib";
import { useContacts } from "store/hooks";
import { Icon } from "components";
import { framework } from "components/tabling/generic";

import { GenericModelMenuEditor } from "./generic";

interface ContactEditorProps<
  R extends Table.RowData & { readonly contact: number | null },
  M extends Model.Model = Model.Model,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
> extends Table.EditorParams<R, M, S> {
  readonly onNewContact: (params: { name?: string; change: Omit<Table.SoloCellChange<R, M>, "newValue"> }) => void;
}

/* eslint-disable indent */
const ContactEditor = <
  R extends Table.RowData & { readonly contact: number | null },
  M extends Model.Model = Model.Model,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>(
  props: ContactEditorProps<R, M, S>,
  ref: ForwardedRef<any>
) => {
  const contacts = useContacts();

  const [editor] = framework.editors.useModelMenuEditor<Model.Contact, ID, R, M, S>({
    ...props,
    forwardedRef: ref
  });
  return (
    <GenericModelMenuEditor<Model.Contact, ID, R, M, S>
      {...props}
      editor={editor}
      style={{ width: 160 }}
      selected={editor.value}
      models={filter(contacts, (m: Model.Contact) => m.full_name !== "")}
      onChange={(e: MenuChangeEvent<Model.Contact>) => editor.onChange(e.model.id, e.event)}
      searchIndices={["first_name", "last_name"]}
      tagProps={{ color: "#EFEFEF", textColor: "#2182e4", modelTextField: "full_name", className: "tag--contact" }}
      extra={[
        {
          id: "add-contact",
          onClick: () => {
            const row: Table.DataRow<R, M> = props.node.data;
            if (tabling.typeguards.isModelRow(row)) {
              const searchValue = editor.menu.current.getSearchValue();
              editor.stopEditing(false);
              if (searchValue !== "") {
                props.onNewContact({
                  name: searchValue,
                  change: {
                    oldValue: (row.contact || null) as unknown as Table.RowValue<R>,
                    field: props.column.field,
                    row,
                    id: row.id
                  }
                });
              } else {
                props.onNewContact({
                  change: {
                    oldValue: (row.contact || null) as unknown as Table.RowValue<R>,
                    field: props.column.field,
                    row,
                    id: row.id
                  }
                });
              }
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

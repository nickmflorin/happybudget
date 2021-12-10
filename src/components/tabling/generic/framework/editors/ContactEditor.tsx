import React, { forwardRef, ForwardedRef } from "react";
import { filter, isNil } from "lodash";

import { tabling } from "lib";
import { useFilteredContacts, useFilteredContactsLoading } from "store/hooks";
import { Icon } from "components";
import { framework } from "components/tabling/generic";

import { GenericModelMenuEditor } from "./generic";

interface ContactEditorProps<
  R extends Table.RowData & { readonly contact: number | null },
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> extends Table.EditorParams<R, M, S> {
  readonly onNewContact: (params: { name?: string; rowId: Table.ModelRowId }) => void;
  readonly setSearch: (value: string) => void;
}

/* eslint-disable indent */
const ContactEditor = <
  R extends Table.RowData & { readonly contact: number | null },
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: ContactEditorProps<R, M, S>,
  ref: ForwardedRef<any>
) => {
  const contacts = useFilteredContacts();
  const loading = useFilteredContactsLoading();

  const [editor] = framework.editors.useModelMenuEditor<Model.Contact, ID, R, M, S>({
    ...props,
    forwardedRef: ref
  });
  return (
    <GenericModelMenuEditor<Model.Contact, ID, R, M, S>
      {...props}
      editor={editor}
      style={{ width: 160 }}
      loading={loading}
      clientSearching={false}
      selected={editor.value}
      onSearch={(v: string) => props.setSearch(v)}
      models={filter(contacts, (m: Model.Contact) => m.full_name !== "")}
      onChange={(e: MenuChangeEvent<MenuItemSelectedState, Model.Contact>) => editor.onChange(e.model.id, e.event)}
      searchIndices={["first_name", "last_name"]}
      tagProps={{ color: "#EFEFEF", textColor: "#2182e4", modelTextField: "full_name", className: "tag--contact" }}
      extra={[
        {
          id: "add-contact",
          onClick: () => {
            const row: Table.DataRow<R> = props.node.data;
            if (tabling.typeguards.isModelRow(row) && !isNil(props.column.field)) {
              const searchValue = editor.menu.current.getSearchValue();
              editor.stopEditing(false);
              if (searchValue !== "") {
                props.onNewContact({
                  name: searchValue,
                  rowId: row.id
                });
              } else {
                props.onNewContact({ rowId: row.id });
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

export default React.memo(forwardRef(ContactEditor));

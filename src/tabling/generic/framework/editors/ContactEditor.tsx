import { forwardRef, ForwardedRef } from "react";
import { filter, isNil } from "lodash";

import { tabling, model } from "lib";
import * as store from "store";

import { Icon } from "components";
import { framework } from "tabling/generic";

import { GenericModelMenuEditor } from "./generic";

interface ContactEditorProps<
  R extends Table.RowData & { readonly contact: number | null },
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> extends Table.EditorParams<R, M, S> {
  readonly onNewContact: (params: { name?: string; rowId: Table.ModelRowId }) => void;
  readonly setSearch: (value: string) => void;
}

const ContactEditor = <
  R extends Table.RowData & { readonly contact: number | null },
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: ContactEditorProps<R, M, S>,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  ref: ForwardedRef<any>
) => {
  const cs = store.hooks.useFilteredContacts();
  const loading = store.hooks.useFilteredContactsLoading();

  const [editor] = framework.editors.useModelMenuEditor<number, Model.Contact, R, M, S>({
    ...props,
    forwardedRef: ref
  });
  return (
    <GenericModelMenuEditor<number, Model.Contact, R, M, S>
      {...props}
      editor={editor}
      style={{ width: 160 }}
      loading={loading}
      clientSearching={false}
      selected={editor.value}
      onSearch={(v: string) => props.setSearch(v)}
      models={filter(cs, (m: Model.Contact) => m.full_name !== "")}
      onChange={(e: MenuChangeEvent<MenuItemSelectedState, Model.Contact>) => editor.onChange(e.model.id, e.event)}
      tagProps={{
        color: "#EFEFEF",
        textColor: "#2182e4",
        className: "tag--contact",
        getModelText: (m: Model.Contact) => model.contact.contactName(m)
      }}
      extra={[
        {
          id: "add-contact",
          onClick: () => {
            const row: Table.DataRow<R> = props.node.data;
            if (tabling.rows.isModelRow(row) && !isNil(props.column.field)) {
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

export default forwardRef(ContactEditor);

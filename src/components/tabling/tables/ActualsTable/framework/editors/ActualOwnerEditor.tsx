import { forwardRef, ForwardedRef } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { ActualOwnersMenu } from "components/menus";
import { framework } from "components/tabling/generic";

interface ActualOwnerEditorProps
  extends Table.EditorParams<Tables.ActualRowData, Model.Actual, Tables.ActualTableStore, Model.SimpleSubAccount> {
  readonly setSearch: (value: string) => void;
}

const ActualOwnerEditor = ({ setSearch, ...props }: ActualOwnerEditorProps, ref: ForwardedRef<any>) => {
  const owners = useSelector((state: Application.Authenticated.Store) => props.selector(state).owners.data);
  const search = useSelector((state: Application.Authenticated.Store) => props.selector(state).owners.search);
  const loading = useSelector((state: Application.Authenticated.Store) => props.selector(state).owners.loading);

  const [editor] = framework.editors.useModelMenuEditor<
    Model.SimpleSubAccount | Model.SimpleMarkup,
    Model.SimpleSubAccount | Model.SimpleMarkup,
    Tables.ActualRowData,
    Model.Actual,
    Tables.ActualTableStore
  >({
    ...props,
    forwardedRef: ref
  });

  return (
    <ActualOwnersMenu
      style={{ minWidth: 200, maxWidth: 300 }}
      loading={loading}
      onSearch={(v: string) => setSearch(v)}
      search={search}
      selected={!isNil(editor.value) ? `${editor.value.type}-${editor.value.id}` : null}
      models={owners}
      includeSearch={true}
      onChange={(m: Model.SimpleSubAccount | Model.SimpleMarkup, e: Table.CellDoneEditingEvent) => {
        editor.onChange(m, e);
      }}
      menu={editor.menu as NonNullRef<IMenuRef<MenuItemSelectedState, Model.ActualOwner>>}
      focusSearchOnCharPress={true}
    />
  );
};

export default forwardRef(ActualOwnerEditor);

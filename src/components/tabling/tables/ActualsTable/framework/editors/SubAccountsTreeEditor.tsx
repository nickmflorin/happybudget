import { forwardRef, ForwardedRef } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { SubAccountTreeMenu } from "components/menus";
import { framework } from "components/tabling/generic";

interface SubAccountsTreeEditorProps
  extends Table.EditorParams<
    Tables.ActualRowData,
    Model.Actual,
    Model.Group,
    Tables.ActualTableStore,
    Model.SimpleSubAccount
  > {
  readonly setSearch: (value: string) => void;
}

const SubAccountsTreeEditor = ({ setSearch, ...props }: SubAccountsTreeEditorProps, ref: ForwardedRef<any>) => {
  const tree = useSelector((state: Application.Authenticated.Store) => props.selector(state).subAccountsTree.data);
  const search = useSelector((state: Application.Authenticated.Store) => props.selector(state).subAccountsTree.search);
  const loading = useSelector(
    (state: Application.Authenticated.Store) => props.selector(state).subAccountsTree.loading
  );

  const [editor] = framework.editors.useModelMenuEditor<
    Model.SimpleSubAccount,
    Model.SimpleSubAccount,
    Tables.ActualRowData,
    Model.Actual,
    Model.Group,
    Tables.ActualTableStore
  >({
    ...props,
    forwardedRef: ref
  });

  return (
    <SubAccountTreeMenu
      style={{ minWidth: 200, maxWidth: 300 }}
      loading={loading}
      onSearch={(v: string) => setSearch(v)}
      search={search}
      selected={!isNil(editor.value) ? editor.value.id : null}
      nodes={tree}
      defaultFocusOnlyItem={true}
      defaultFocusFirstItem={true}
      includeSearch={true}
      autoFocusMenu={true}
      onChange={(m: Model.SimpleSubAccount, e: Table.CellDoneEditingEvent) => {
        editor.onChange(m, e);
      }}
      menu={editor.menu as NonNullRef<IMenuRef<Model.SubAccountTreeNode>>}
      focusSearchOnCharPress={true}
    />
  );
};

export default forwardRef(SubAccountsTreeEditor);

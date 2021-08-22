import { forwardRef } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { redux } from "lib";
import { SubAccountTreeMenu } from "components/menus";
import { framework } from "components/tabling/generic";

// It is not ideal that we are importing part of the store in a generalized components
// directory.  We should consider alternate solutions to this or potentially moving the
// cell component into the app directory.
const selectSubAccountsTree = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subAccountsTree.data
);
const selectSubAccountsTreeSearch = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subAccountsTree.search
);
const selectSubAccountsTreeLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subAccountsTree.loading
);

interface SubAccountsTreeEditorProps extends Table.EditorParams<Tables.ActualRow, Model.Actual> {
  readonly setSearch: (value: string) => void;
  readonly value: Model.SimpleSubAccount | null;
}

const SubAccountsTreeEditor = ({ setSearch, ...props }: SubAccountsTreeEditorProps, ref: any) => {
  const subAccountsTree = useSelector(selectSubAccountsTree);
  const search = useSelector(selectSubAccountsTreeSearch);
  const loading = useSelector(selectSubAccountsTreeLoading);

  const [editor] = framework.editors.useModelMenuEditor<Tables.ActualRow, Model.Actual, Model.SimpleSubAccount>({
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
      nodes={subAccountsTree}
      defaultFocusOnlyItem={true}
      defaultFocusFirstItem={true}
      includeSearch={true}
      autoFocusMenu={true}
      onChange={(m: Model.SimpleSubAccount, e: Table.CellDoneEditingEvent) => {
        editor.onChange(m, e);
      }}
      ref={editor.menu as NonNullRef<IMenuRef<Model.SubAccountTreeNode>>}
      focusSearchOnCharPress={true}
    />
  );
};

export default forwardRef(SubAccountsTreeEditor);

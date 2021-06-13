import { useRef, forwardRef } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { BudgetItemTreeMenu, ExpandedModelMenuRef, BudgetItemMenuModel } from "components/menus";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

import useModelMenuEditor from "./ModelMenuEditor";

const selectBudgetItemsTree = simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.budgetItemsTree.data
);
const selectBudgetItemsTreeSearch = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.budgetItemsTree.search
);
const selectBudgetItemsTreeLoading = simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budgeting.budget.budgetItemsTree.loading
);

interface BudgetItemsTreeEditorProps extends Table.CellEditorParams {
  readonly setSearch: (value: string) => void;
  readonly value: Model.SimpleAccount | Model.SimpleSubAccount;
}

const BudgetItemsTreeEditor = ({ setSearch, ...props }: BudgetItemsTreeEditorProps, ref: any) => {
  const budgetItemsTree = useSelector(selectBudgetItemsTree);
  const search = useSelector(selectBudgetItemsTreeSearch);
  const loading = useSelector(selectBudgetItemsTreeLoading);
  const menuRef = useRef<ExpandedModelMenuRef<BudgetItemMenuModel>>(null);

  const [editor] = useModelMenuEditor<Model.SimpleAccount | Model.SimpleSubAccount>({
    ...props,
    menuRef,
    forwardedRef: ref
  });

  return (
    <BudgetItemTreeMenu
      style={{ width: 200 }}
      menuLoading={loading}
      onSearch={(v: string) => setSearch(v)}
      search={search}
      selected={!isNil(editor.value) ? { id: editor.value.id, type: editor.value.type } : null}
      nodes={budgetItemsTree}
      defaultFocusOnlyItem={true}
      defaultFocusFirstItem={true}
      autoFocusMenu={true}
      onChange={(m: Model.SimpleSubAccount | Model.SimpleAccount, e: Table.CellDoneEditingEvent) => {
        editor.onChange(m, e);
      }}
      menuRef={menuRef}
      focusSearchOnCharPress={true}
    />
  );
};

export default forwardRef(BudgetItemsTreeEditor);

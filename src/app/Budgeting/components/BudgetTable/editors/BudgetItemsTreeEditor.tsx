import { useImperativeHandle, useRef, useState, useEffect, forwardRef } from "react";
import { useSelector } from "react-redux";
import { isNil } from "lodash";

import { ICellEditorParams } from "@ag-grid-community/core";

import { BudgetItemTreeMenu, ExpandedModelMenuRef, BudgetItemMenuModel } from "components/menus";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

const selectBudgetItemsTree = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.budgetItemsTree.data
);
const selectBudgetItemsTreeSearch = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.budgetItemsTree.search
);
const selectBudgetItemsTreeLoading = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budgeting.budget.budgetItemsTree.loading
);

interface BudgetItemsTreeEditorProps extends ICellEditorParams {
  readonly setSearch: (value: string) => void;
}

const BudgetItemsTreeEditor = (props: BudgetItemsTreeEditorProps, ref: any) => {
  const budgetItemsTree = useSelector(selectBudgetItemsTree);
  const search = useSelector(selectBudgetItemsTreeSearch);
  const loading = useSelector(selectBudgetItemsTreeLoading);
  const isFirstRender = useRef(true);
  const menuRef = useRef<ExpandedModelMenuRef<BudgetItemMenuModel>>(null);
  const [value, setValue] = useState<Model.SimpleSubAccount | Model.SimpleAccount | null>(props.value);

  useEffect(() => {
    if (!isNil(props.charPress)) {
      const menuRefObj = menuRef.current;
      if (!isNil(menuRefObj)) {
        menuRefObj.focusSearch(true, props.charPress);
      }
    }
  }, [props.charPress, menuRef.current]);

  useEffect(() => {
    if (!isFirstRender.current) {
      props.stopEditing();
    }
  }, [value]);

  useEffect(() => {
    isFirstRender.current = false;
  }, []);

  useImperativeHandle(ref, () => {
    return {
      getValue: () => value,
      isCancelBeforeStart() {
        // Gets called once before editing starts, which gives us an opportunity
        // to cancel the editing before it even starts.
        return props.keyPress === KEY_BACKSPACE || props.keyPress === KEY_DELETE;
      },
      isCancelAfterEnd() {
        // Gets called once when editing is finished.  If this returns true, then
        // the result of the edit will be ignored.
        return false;
      },
      isPopup() {
        return true;
      },
      getPopupPosition() {
        return "under";
      }
    };
  });

  return (
    <BudgetItemTreeMenu
      style={{ width: 200 }}
      menuLoading={loading}
      onSearch={(v: string) => props.setSearch(v)}
      search={search}
      selected={!isNil(value) ? value.id : null}
      nodes={budgetItemsTree}
      onChange={(m: Model.SimpleSubAccount | Model.SimpleAccount) => setValue(m)}
      ref={menuRef}
      focusSearchOnCharPress={true}
    />
  );
};

export default forwardRef(BudgetItemsTreeEditor);

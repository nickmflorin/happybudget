import { useImperativeHandle, useRef, useState, useEffect, forwardRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { isNil, map, find } from "lodash";

import { ICellEditorParams } from "@ag-grid-community/core";

import { BudgetItemTreeMenu, ExpandedModelMenuRef, BudgetItemMenuModel } from "components/menus";
import { useDeepEqualMemo, useTrackFirstRender } from "lib/hooks";
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
  readonly value: Model.SimpleAccount | Model.SimpleSubAccount;
}

const BudgetItemsTreeEditor = (props: BudgetItemsTreeEditorProps, ref: any) => {
  const budgetItemsTree = useSelector(selectBudgetItemsTree);
  const search = useSelector(selectBudgetItemsTreeSearch);
  const loading = useSelector(selectBudgetItemsTreeLoading);
  const isFirstRender = useTrackFirstRender();
  const menuRef = useRef<ExpandedModelMenuRef<BudgetItemMenuModel>>(null);
  const [id, setId] = useState<number | null>(!isNil(props.value) ? props.value.id : null);
  const [type, setType] = useState<"account" | "subaccount" | null>(!isNil(props.value) ? props.value.type : null);

  // This is kind of a pain in the neck, but AG Grid does not seem to work well
  // with the value change detection when setting the entire
  // Model.SimpleSubAccount | Model.SimpleAccount object - so we have to set the
  // ID and the Type individually, and reconstruct the model from the set of
  // flattened out models.
  const flattenedModels = useMemo<(Model.SimpleAccount | Model.SimpleSubAccount)[]>(() => {
    const flattened: (Model.SimpleAccount | Model.SimpleSubAccount)[] = [];
    const addModel = (m: Model.AccountTreeNode | Model.SubAccountTreeNode) => {
      const { children, ...rest } = m;
      flattened.push(rest);
      for (let i = 0; i < children.length; i++) {
        addModel(children[i]);
      }
    };
    map(budgetItemsTree, (model: Model.AccountTreeNode | Model.SubAccountTreeNode) => addModel(model));
    return flattened;
  }, [useDeepEqualMemo(budgetItemsTree)]);

  useEffect(() => {
    if (!isNil(props.charPress)) {
      const menuRefObj = menuRef.current;
      if (!isNil(menuRefObj)) {
        menuRefObj.focusSearch(true, props.charPress);
      }
    }
  }, [props.charPress]);

  useEffect(() => {
    if (!isFirstRender) {
      if ((!isNil(id) && !isNil(type)) || (isNil(id) && isNil(type))) {
        props.stopEditing();
      }
    }
  }, [id, type]);

  useImperativeHandle(ref, () => {
    return {
      getValue: () => {
        const model: Model.SimpleSubAccount | Model.SimpleAccount | undefined = find(flattenedModels, {
          id,
          type
        } as any);
        if (!isNil(model)) {
          return model;
        }
        return props.value;
      },
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
      selected={!isNil(id) && !isNil(type) ? { id, type } : null}
      nodes={budgetItemsTree}
      defaultFocusOnlyItem={true}
      defaultFocusFirstItem={true}
      onChange={(m: Model.SimpleSubAccount | Model.SimpleAccount) => {
        setId(m.id);
        setType(m.type);
      }}
      menuRef={menuRef}
      focusSearchOnCharPress={true}
    />
  );
};

export default forwardRef(BudgetItemsTreeEditor);

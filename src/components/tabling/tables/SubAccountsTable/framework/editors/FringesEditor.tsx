import { forwardRef } from "react";
import { useSelector } from "react-redux";
import { isNil, filter, map } from "lodash";

import { Icon } from "components";
import { ModelTagsMenu } from "components/menus";
import { framework } from "components/tabling/generic";

// It is not ideal that we are importing part of the store in a generalized components
// directory.  We should consider alternate solutions to this or potentially moving the
// cell component into the app directory.
const fringesSelector = (budgetType: Model.BudgetType, levelType: BudgetTable.LevelType) => {
  return (state: Modules.ApplicationStore) => {
    /* eslint-disable indent */
    switch (budgetType) {
      case "budget":
        switch (levelType) {
          case "account":
            return state.budget.budget.account.table.fringes.data;
          case "subaccount":
            return state.budget.budget.subaccount.table.fringes.data;
          default:
            return [];
        }
      case "template":
        switch (levelType) {
          case "account":
            return state.budget.template.account.table.fringes.data;
          case "subaccount":
            return state.budget.template.subaccount.table.fringes.data;
          default:
            return [];
        }
      default:
        return [];
    }
  };
};

export interface FringesEditorProps extends Table.EditorParams<Tables.SubAccountRow, Model.SubAccount> {
  readonly onAddFringes: () => void;
  readonly colId: keyof Tables.SubAccountRow;
  readonly budgetType: Model.BudgetType;
  readonly levelType: BudgetTable.LevelType;
}

const FringesEditor = (props: FringesEditorProps, ref: any) => {
  const selector = fringesSelector(props.budgetType, props.levelType);
  const fringes = useSelector(selector);
  const [editor] = framework.editors.useModelMenuEditor<
    Tables.SubAccountRow,
    Model.SubAccount,
    Model.Fringe,
    Model.Fringe[]
  >({
    ...props,
    forwardedRef: ref
  });

  return (
    <ModelTagsMenu<Model.Fringe>
      style={{ minWidth: 220 }}
      checkbox={true}
      mode={"multiple"}
      menu={editor.menu}
      includeSearch={true}
      selected={map(editor.value, (v: Model.Fringe) => v.id)}
      models={filter(fringes, (fringe: Model.Fringe) => !isNil(fringe.name) && fringe.name.trim() !== "")}
      onChange={(e: MenuChangeEvent<Model.Fringe>) => {
        const selectedStates = filter(
          e.state,
          (s: IMenuItemState<Model.Fringe>) => s.selected === true
        ) as IMenuItemState<Model.Fringe>[];
        const ms = map(selectedStates, (s: IMenuItemState<Model.Fringe>) => s.model);
        editor.onChange(ms, e.event, false);
      }}
      searchIndices={["name"]}
      focusSearchOnCharPress={true}
      defaultFocusOnlyItem={true}
      defaultFocusFirstItem={true}
      autoFocusMenu={true}
      extra={[
        {
          id: "add-fringes",
          onClick: () => props.onAddFringes(),
          label: "Add Fringes",
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

export default forwardRef(FringesEditor);

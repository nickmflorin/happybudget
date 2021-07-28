import { forwardRef } from "react";
import { useSelector } from "react-redux";
import { map } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/pro-light-svg-icons";

import { ExpandedModelTagsMenu } from "components/menus";
import useModelMenuEditor from "./ModelMenuEditor";

// Note: This might be slightly problematic with memoization and perfromance, since
// we have to dynamically create the selector.  We should investigate if there is a
// better way to do this. possibly with reselect.
const fringesSelector = (budgetType: Model.BudgetType, levelType: BudgetTable.LevelType) => {
  return (state: Modules.ApplicationStore) => {
    /* eslint-disable indent */
    switch ([budgetType, levelType]) {
      case ["budget", "account"]:
        return state.budget.budget.account.fringes.data;
      case ["budget", "subaccount"]:
        return state.budget.budget.subaccount.fringes.data;
      case ["template", "account"]:
        return state.budget.template.account.fringes.data;
      case ["template", "subaccount"]:
        return state.budget.template.subaccount.fringes.data;
      default:
        return [];
    }
  };
};

export interface FringesCellEditorProps<R extends Table.Row> extends Table.CellEditorParams {
  readonly onAddFringes: () => void;
  readonly colId: keyof R;
  readonly budgetType: Model.BudgetType;
  readonly levelType: BudgetTable.LevelType;
}

const FringesCellEditor = <R extends Table.Row>(props: FringesCellEditorProps<R>, ref: any) => {
  const selector = fringesSelector(props.budgetType, props.levelType);
  const fringes = useSelector(selector);
  const [editor] = useModelMenuEditor<Model.Fringe, Model.Fringe[]>({ ...props, forwardedRef: ref });

  return (
    <ExpandedModelTagsMenu<Model.Fringe>
      style={{ minWidth: 220 }}
      highlightActive={false}
      checkbox={true}
      multiple={true}
      selected={map(editor.value, (v: Model.Fringe) => v.id)}
      models={fringes}
      onChange={(ms: Model.Fringe[], e: Table.CellDoneEditingEvent) => editor.onChange(ms, e, false)}
      menuRef={editor.menuRef}
      searchIndices={["name"]}
      focusSearchOnCharPress={true}
      defaultFocusOnlyItem={true}
      defaultFocusFirstItem={true}
      autoFocusMenu={true}
      leftAlign={true}
      fillWidth={false}
      extra={[
        {
          onClick: () => props.onAddFringes(),
          text: "Add Fringes",
          icon: <FontAwesomeIcon className={"icon"} icon={faPlus} />,
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

export default forwardRef(FringesCellEditor);

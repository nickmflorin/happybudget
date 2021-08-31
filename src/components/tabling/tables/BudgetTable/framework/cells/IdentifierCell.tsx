import { useMemo } from "react";
import { useSelector } from "react-redux";
import { isNil, find } from "lodash";

import { IconButton } from "components/buttons";
import { getGroupColorDefinition } from "lib/model/util";
import { useDeepEqualMemo } from "lib/hooks";

import { Cell, ValueCell } from "components/tabling/generic/framework/cells";

// It is not ideal that we are importing part of the store in a generalized components
// directory.  We should consider alternate solutions to this or potentially moving the
// cell component into the app directory.
const groupsSelector = (budgetType: Model.BudgetType, levelType: BudgetTable.LevelType) => {
  return (state: Modules.Authenticated.StoreObj) => {
    /* eslint-disable indent */
    switch (budgetType) {
      case "budget":
        switch (levelType) {
          case "budget":
            return state.budget.budget.budget.table.groups.data;
          case "account":
            return state.budget.budget.account.table.groups.data;
          case "subaccount":
            return state.budget.budget.subaccount.table.groups.data;
          default:
            return [];
        }
      case "template":
        switch (levelType) {
          case "budget":
            return state.budget.template.budget.table.groups.data;
          case "account":
            return state.budget.template.account.table.groups.data;
          case "subaccount":
            return state.budget.template.subaccount.table.groups.data;
          default:
            return [];
        }
      default:
        return [];
    }
  };
};

interface IdentifierCellProps<R extends BudgetTable.Row, M extends Model.Model>
  extends BudgetTable.ValueCellProps<R, M> {
  readonly onGroupEdit?: (group: Model.Group) => void;
}

const IdentifierCell = <R extends BudgetTable.Row, M extends Model.Model>({
  onGroupEdit,
  budgetType,
  levelType,
  ...props
}: IdentifierCellProps<R, M>): JSX.Element => {
  const row: R = props.node.data;
  const selector = groupsSelector(budgetType, levelType);
  const groups = useSelector(selector);

  const groupId = useMemo(() => {
    return row.meta.isGroupRow === true ? row.meta.group || null : null;
  }, [row.meta.isGroupRow, row.meta.group]);

  const group = useMemo<Model.Group | null>((): Model.Group | null => {
    const g: Model.Group | null = find(groups, { id: groupId } as any) || null;
    return g;
  }, [groupId, useDeepEqualMemo(groups)]);

  const colorDef = useMemo(() => {
    return !isNil(group) ? getGroupColorDefinition(group) : null;
  }, [group]);

  const groupCell = useMemo(() => {
    if (!isNil(group) && !isNil(colorDef)) {
      return (
        <Cell {...props}>
          <div style={{ display: "flex" }}>
            <span>{`${group.name} (${group.children.length} Line Items)`}</span>
            <IconButton
              className={"btn btn--edit-group"}
              size={"xxsmall"}
              icon={"edit"}
              onClick={() => !isNil(onGroupEdit) && onGroupEdit(group)}
              style={!isNil(colorDef.color) ? { color: colorDef.color } : {}}
            />
          </div>
        </Cell>
      );
    }
    return null;
  }, [colorDef, group, onGroupEdit]);

  if (!isNil(row.meta.isGroupRow)) {
    return !isNil(groupCell) ? groupCell : <></>;
  }
  return <ValueCell {...props} />;
};

export default IdentifierCell;

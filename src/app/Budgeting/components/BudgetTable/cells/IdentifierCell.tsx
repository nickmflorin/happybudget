import { useMemo } from "react";
import { useSelector } from "react-redux";
import { isNil, find } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-regular-svg-icons";

import { IconButton } from "components/buttons";
import { getGroupColorDefinition } from "lib/model/util";

import Cell from "./Cell";
import ValueCell, { ValueCellProps } from "./ValueCell";

import "./index.scss";
import { useDeepEqualMemo } from "lib/hooks";

// Note: This might be slightly problematic with memoization and perfromance, since
// we have to dynamically create the selector.  We should investigate if there is a
// better way to do this. possibly with reselect.
const groupsSelector = (budgetType: Model.BudgetType, levelType: BudgetTable.LevelType) => {
  return (state: Modules.ApplicationStore) => {
    /* eslint-disable indent */
    switch ([budgetType, levelType]) {
      case ["budget", "budget"]:
        return state.budget.budget.budget.groups.data;
      case ["budget", "account"]:
        return state.budget.budget.account.groups.data;
      case ["budget", "subaccount"]:
        return state.budget.budget.subaccount.groups.data;
      case ["template", "template"]:
        return state.budget.template.budget.groups.data;
      case ["template", "account"]:
        return state.budget.template.account.groups.data;
      case ["template", "subaccount"]:
        return state.budget.template.subaccount.groups.data;
      default:
        return [];
    }
  };
};

interface IdentifierCellProps<R extends Table.Row> extends ValueCellProps<R> {
  readonly onGroupEdit?: (group: Model.Group) => void;
  readonly budgetType: Model.BudgetType;
  readonly levelType: BudgetTable.LevelType;
}

const IdentifierCell = <R extends Table.Row>({
  onGroupEdit,
  budgetType,
  levelType,
  ...props
}: IdentifierCellProps<R>): JSX.Element => {
  const selector = groupsSelector(budgetType, levelType);
  const groups = useSelector(selector);

  const groupId = useMemo(() => {
    return props.node.data.meta.isGroupFooter === true ? props.node.data.group || null : null;
  }, [props.node.data.meta.isGroupFooter, props.node.data.group]);

  const group = useMemo<Model.Group | null>((): Model.Group | null => {
    const g: Model.Group | null = find(groups, { id: groupId } as any) || null;
    return g;
  }, [groupId, props.node.data.group, useDeepEqualMemo(groups)]);

  const colorDef = useMemo(() => {
    return !isNil(group) ? getGroupColorDefinition(group) : null;
  }, [group]);

  const groupCell = useMemo(() => {
    if (!isNil(group) && !isNil(colorDef)) {
      return (
        <Cell className={"cell--identifier"} {...props}>
          <div style={{ display: "flex" }}>
            <span>{`${group.name} (${group.children.length} Line Items)`}</span>
            <IconButton
              className={"btn--edit-group"}
              size={"small"}
              icon={
                <FontAwesomeIcon
                  color={colorDef.color}
                  style={!isNil(colorDef.color) ? { color: colorDef.color } : {}}
                  icon={faEdit}
                />
              }
              onClick={() => !isNil(onGroupEdit) && onGroupEdit(group)}
              style={!isNil(colorDef.color) ? { color: colorDef.color } : {}}
            />
          </div>
        </Cell>
      );
    }
    return null;
  }, [colorDef, group, onGroupEdit]);

  if (!isNil(groupCell)) {
    return groupCell;
  }
  const row: R = props.node.data;
  return (
    <ValueCell
      {...props}
      className={classNames(
        "cell--identifier",
        row.meta.isTableFooter === false && row.meta.isBudgetFooter === false ? props.className : undefined
      )}
    >
      {props.children}
    </ValueCell>
  );
};

export default IdentifierCell;

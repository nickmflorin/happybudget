import React, { useMemo } from "react";
import { filter, includes, isNil, map } from "lodash";
import classNames from "classnames";

import { Input, Checkbox, Tooltip } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/pro-regular-svg-icons";

import { RowNode } from "@ag-grid-community/core";

import { ShowHide } from "components";
import { Button, IconButton } from "components/buttons";
import { PortalOrRender } from "components/layout";

import "./BudgetTableMenu.scss";

interface BudgetTableMenuActionProps {
  readonly action: BudgetTable.MenuAction;
}

const BudgetTableMenuAction = ({ action }: BudgetTableMenuActionProps): JSX.Element => {
  const innerElement = useMemo(() => {
    if (!isNil(action.render)) {
      return action.render();
    } else if (!isNil(action.text)) {
      return (
        <Button
          onClick={() => !isNil(action.onClick) && action.onClick()}
          className={"btn btn--bare btn--budget-table-menu"}
          disabled={action.disabled}
          icon={<FontAwesomeIcon className={"icon"} icon={action.icon} />}
          tooltip={
            /* eslint-disable indent */
            !isNil(action.tooltip)
              ? typeof action.tooltip === "string"
                ? {
                    title: action.tooltip,
                    placement: "bottom",
                    overlayClassName: classNames({ disabled: action.disabled === true })
                  }
                : {
                    placement: "bottom",
                    ...action.tooltip,
                    overlayClassName: classNames(
                      { disabled: action.disabled === true },
                      action.tooltip.overlayClassName
                    )
                  }
              : {}
          }
        >
          {action.text}
        </Button>
      );
    } else {
      return (
        <IconButton
          className={"btn btn--budget-table-menu dark"}
          size={"large"}
          onClick={() => !isNil(action.onClick) && action.onClick()}
          disabled={action.disabled}
          icon={<FontAwesomeIcon className={"icon"} icon={action.icon} />}
          tooltip={
            /* eslint-disable indent */
            !isNil(action.tooltip)
              ? typeof action.tooltip === "string"
                ? {
                    title: action.tooltip,
                    placement: "bottom",
                    overlayClassName: classNames({ disabled: action.disabled === true })
                  }
                : {
                    placement: "bottom",
                    ...action.tooltip,
                    overlayClassName: classNames(
                      { disabled: action.disabled === true },
                      action.tooltip.overlayClassName
                    )
                  }
              : {}
          }
        />
      );
    }
  }, [action]);

  if (!isNil(action.wrap)) {
    return action.wrap(innerElement);
  }
  return innerElement;
};

const BudgetTableMenu = <R extends Table.Row, M extends Model.Model>({
  apis,
  actions,
  search,
  detached = false,
  columns,
  selectedRows,
  onSearch
}: BudgetTable.MenuProps<R, M>) => {
  return (
    <PortalOrRender id={"supplementary-header"} portal={!detached}>
      <div className={classNames("budget-table-menu", { detached })}>
        <div className={"budget-table-menu-left"}>
          <Tooltip title={"Select All"} placement={"bottom"}>
            <Checkbox
              onChange={(e: CheckboxChangeEvent) => {
                apis.grid.forEachNode((node: RowNode) => {
                  const row: R = node.data;
                  if (
                    row.meta.isGroupFooter === false &&
                    row.meta.isTableFooter === false &&
                    row.meta.isBudgetFooter === false
                  ) {
                    node.setSelected(e.target.checked);
                  }
                });
              }}
            />
          </Tooltip>
          {!isNil(actions) && (
            <div className={"toolbar-buttons"}>
              {map(
                Array.isArray(actions)
                  ? actions
                  : actions({
                      apis,
                      columns: filter(columns, (col: Table.Column<R, M>) => !includes(["index", "expand"], col.field)),
                      selectedRows
                    }),
                (action: BudgetTable.MenuAction, index: number) => (
                  <BudgetTableMenuAction key={index} action={action} />
                )
              )}
            </div>
          )}
        </div>
        <div className={"budget-table-menu-right"}>
          <ShowHide show={!isNil(search)}>
            <Input
              className={"input--small"}
              placeholder={"Search Rows"}
              value={search}
              allowClear={true}
              prefix={<FontAwesomeIcon className={"icon"} icon={faSearch} />}
              style={{ maxWidth: 300, minWidth: 100 }}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                !isNil(onSearch) && onSearch(event.target.value)
              }
            />
          </ShowHide>
        </div>
      </div>
    </PortalOrRender>
  );
};

export default BudgetTableMenu;

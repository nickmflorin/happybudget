import React from "react";
import { isNil, map } from "lodash";
import classNames from "classnames";

import { Checkbox, Tooltip } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { RowNode } from "@ag-grid-community/core";

import { ShowHide, SavingChanges } from "components";
import { SearchInput } from "components/fields";
import { Portal } from "components/layout";
import TableMenuAction from "./MenuAction";
import "./index.scss";

export interface TableMenuProps<R extends Table.Row, M extends Model.Model> {
  readonly apis: Table.GridApis | null;
  readonly columns: Table.Column<R, M>[];
  readonly actions?: Table.MenuAction[] | ((params: Table.MenuActionParams<R, M>) => Table.MenuAction[]);
  readonly saving?: boolean;
  readonly search?: string;
  readonly selectedRows: R[];
  readonly menuPortalId?: string;
  readonly hiddenColumns: Table.Field<R, M>[];
  readonly onSearch?: (value: string) => void;
  readonly rowHasCheckboxSelection?: (row: R) => boolean;
}

const PrivateTableMenu = <R extends Table.Row, M extends Model.Model>({
  apis,
  actions,
  search,
  columns,
  selectedRows,
  saving,
  hiddenColumns,
  detached,
  onSearch,
  rowHasCheckboxSelection
}: Omit<TableMenuProps<R, M>, "menuPortalId"> & { readonly detached: boolean }) => (
  /* eslint-disable indent */
  <div className={classNames("table-action-menu", { detached })}>
    <div className={"table-menu-left"}>
      <Tooltip title={"Select All"} placement={"bottom"}>
        <Checkbox
          onChange={(e: CheckboxChangeEvent) => {
            if (!isNil(apis)) {
              apis.grid.forEachNode((node: RowNode) => {
                const row: R = node.data;
                if (isNil(rowHasCheckboxSelection) || rowHasCheckboxSelection(row)) {
                  node.setSelected(e.target.checked);
                }
              });
            }
          }}
        />
      </Tooltip>
      {!isNil(actions) && (
        <div className={"toolbar-buttons"}>
          {!isNil(apis) &&
            map(
              /* eslint-disable indent */
              Array.isArray(actions)
                ? actions
                : actions({
                    apis,
                    columns,
                    selectedRows,
                    hiddenColumns
                  }),
              (action: Table.MenuAction, index: number) => <TableMenuAction key={index} action={action} />
            )}
        </div>
      )}
    </div>
    <div className={"table-menu-right"}>
      {/* Reserved for cases where the table is not a full page table and thus the Saving Changes in the page header is not visible. */}
      {!isNil(saving) && <SavingChanges saving={saving} />}
      <ShowHide show={!isNil(search)}>
        <SearchInput
          className={"input--small"}
          placeholder={"Search Rows"}
          value={search}
          style={{ maxWidth: 300, minWidth: 100 }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => !isNil(onSearch) && onSearch(event.target.value)}
        />
      </ShowHide>
    </div>
  </div>
);

const TableMenu = <R extends Table.Row, M extends Model.Model>({ menuPortalId, ...props }: TableMenuProps<R, M>) =>
  !isNil(menuPortalId) ? (
    <Portal id={menuPortalId}>
      <PrivateTableMenu {...props} detached={false} />
    </Portal>
  ) : (
    <PrivateTableMenu {...props} detached={true} />
  );

export default TableMenu;

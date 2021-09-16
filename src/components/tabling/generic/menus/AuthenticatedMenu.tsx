import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { Checkbox, Tooltip } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { RowNode } from "@ag-grid-community/core";

import { tabling } from "lib";

import { ShowHide, SavingChanges } from "components";
import { SearchInput } from "components/fields";
import { Portal } from "components/layout";

import AuthenticatedToolbar from "./AuthenticatedToolbar";

import "./index.scss";

export interface AuthenticatedMenuProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> {
  readonly columns: Table.Column<R, M>[];
  readonly search?: string;
  readonly menuPortalId?: string;
  readonly actions?: Table.AuthenticatedMenuActions<R, M>;
  readonly savingChangesPortalId?: string;
  readonly saving?: boolean;
  readonly onSearch: (v: string) => void;
}

type InternalAuthenticatedMenuProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel
> = AuthenticatedMenuProps<R, M> & {
  readonly apis: Table.GridApis | null;
  readonly hiddenColumns: (keyof R | string)[];
  readonly selectedRows: Table.DataRow<R, M>[];
  readonly rowHasCheckboxSelection?: (row: Table.NonGroupRow<R, M>) => boolean;
};

/* eslint-disable indent */
const AuthenticatedMenu = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  props: Omit<InternalAuthenticatedMenuProps<R, M>, "menuPortalId"> & { readonly detached: boolean }
) => (
  /* eslint-disable indent */
  <div className={classNames("table-action-menu", { detached: props.detached })}>
    <Portal id={props.savingChangesPortalId}>
      <SavingChanges saving={props.saving} />
    </Portal>
    <div className={"table-menu-left"}>
      <Tooltip title={"Select All"} placement={"bottom"}>
        <Checkbox
          onChange={(e: CheckboxChangeEvent) => {
            props.apis?.grid.forEachNode((node: RowNode) => {
              const row: Table.Row<R, M> = node.data;
              if (
                !tabling.typeguards.isGroupRow(row) &&
                (isNil(props.rowHasCheckboxSelection) || props.rowHasCheckboxSelection(row))
              ) {
                node.setSelected(e.target.checked);
              }
            });
          }}
        />
      </Tooltip>
      {!isNil(props.actions) && (
        <AuthenticatedToolbar<R, M>
          actions={props.actions}
          columns={props.columns}
          apis={props.apis}
          selectedRows={props.selectedRows}
          hiddenColumns={props.hiddenColumns}
        />
      )}
    </div>
    <div className={"table-menu-right"}>
      {/* Reserved for cases where the table is not a full page table and thus the Saving Changes in the page header is not visible. */}
      {!isNil(props.saving) && isNil(props.savingChangesPortalId) && <SavingChanges saving={props.saving} />}
      <ShowHide show={!isNil(props.search)}>
        <SearchInput
          className={"input--small"}
          placeholder={"Search Rows"}
          value={props.search}
          style={{ maxWidth: 300, minWidth: 100 }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.onSearch(event.target.value)}
        />
      </ShowHide>
    </div>
  </div>
);

const Menu = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>({
  menuPortalId,
  ...props
}: InternalAuthenticatedMenuProps<R, M>) =>
  !isNil(menuPortalId) ? (
    <Portal id={menuPortalId}>
      <AuthenticatedMenu {...props} detached={false} />
    </Portal>
  ) : (
    <AuthenticatedMenu {...props} detached={true} />
  );

export default Menu;

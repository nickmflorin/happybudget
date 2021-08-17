import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { Checkbox, Tooltip } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { RowNode } from "@ag-grid-community/core";

import { ShowHide, SavingChanges } from "components";
import { SearchInput } from "components/fields";
import { Portal } from "components/layout";

import ReadWriteToolbar from "./ReadWriteToolbar";

import "./index.scss";

export interface ReadWriteMenuProps<R extends Table.Row, M extends Model.Model> {
  readonly columns: Table.Column<R, M>[];
  readonly search?: string;
  readonly menuPortalId?: string;
  readonly saving?: boolean;
  readonly actions?: Table.ReadWriteMenuActions<R, M>;
  readonly onSearch?: (value: string) => void;
}

type InternalReadWriteMenuProps<R extends Table.Row, M extends Model.Model> = ReadWriteMenuProps<R, M> & {
  readonly apis: Table.GridApis | null;
  readonly hiddenColumns: Table.Field<R, M>[];
  readonly selectedRows: R[];
  readonly rowHasCheckboxSelection?: (row: R) => boolean;
};

const ReadWriteMenu = <R extends Table.Row, M extends Model.Model>(
  props: Omit<InternalReadWriteMenuProps<R, M>, "menuPortalId"> & { readonly detached: boolean }
) => (
  /* eslint-disable indent */
  <div className={classNames("table-action-menu", { detached: props.detached })}>
    <div className={"table-menu-left"}>
      <Tooltip title={"Select All"} placement={"bottom"}>
        <Checkbox
          onChange={(e: CheckboxChangeEvent) => {
            props.apis?.grid.forEachNode((node: RowNode) => {
              const row: R = node.data;
              if (isNil(props.rowHasCheckboxSelection) || props.rowHasCheckboxSelection(row)) {
                node.setSelected(e.target.checked);
              }
            });
          }}
        />
      </Tooltip>
      {!isNil(props.actions) && (
        <ReadWriteToolbar
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
      {!isNil(props.saving) && <SavingChanges saving={props.saving} />}
      <ShowHide show={!isNil(props.search)}>
        <SearchInput
          className={"input--small"}
          placeholder={"Search Rows"}
          value={props.search}
          style={{ maxWidth: 300, minWidth: 100 }}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            !isNil(props.onSearch) && props.onSearch(event.target.value)
          }
        />
      </ShowHide>
    </div>
  </div>
);

const Menu = <R extends Table.Row, M extends Model.Model>({
  menuPortalId,
  ...props
}: InternalReadWriteMenuProps<R, M>) =>
  !isNil(menuPortalId) ? (
    <Portal id={menuPortalId}>
      <ReadWriteMenu {...props} detached={false} />
    </Portal>
  ) : (
    <ReadWriteMenu {...props} detached={true} />
  );

export default React.memo(Menu) as typeof Menu;

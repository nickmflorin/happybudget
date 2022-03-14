import React from "react";
import { isNil } from "lodash";

import { Checkbox, Tooltip } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";

import { tabling } from "lib";

import AuthenticatedToolbar from "./AuthenticatedToolbar";
import Menu, { InternalMenuProps, MenuProps } from "./Menu";

export type AuthenticatedMenuProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = Omit<
  MenuProps<Table.AuthenticatedMenuActionParams<R, M>, R, M>,
  "menuActionParams"
> & {
  readonly columns: Table.DataColumn<R, M>[];
};

type InternalAuthenticatedMenuProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = Omit<
  InternalMenuProps<Table.AuthenticatedMenuActionParams<R, M>, R, M>,
  "menuActionParams" | "toolbar"
> & {
  readonly apis: Table.GridApis | null;
  readonly hiddenColumns?: Table.HiddenColumns;
  readonly columns: Table.DataColumn<R, M>[];
  readonly selectedRows: Table.EditableRow<R>[];
  readonly rowHasCheckboxSelection?: (row: Table.EditableRow<R>) => boolean;
};

const AuthenticatedMenu = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: Omit<InternalAuthenticatedMenuProps<R, M>, "menuPortalId">
) => {
  return (
    <Menu<Table.AuthenticatedMenuActionParams<R, M>, R, M>
      {...props}
      toolbar={AuthenticatedToolbar}
      menuActionParams={{
        apis: props.apis,
        hiddenColumns: props.hiddenColumns,
        columns: props.columns,
        selectedRows: props.selectedRows
      }}
      prefixLeft={[
        <Tooltip key={"0"} title={"Select All"} placement={"bottom"}>
          <Checkbox
            onChange={(e: CheckboxChangeEvent) => {
              props.apis?.grid.forEachNode((node: Table.RowNode) => {
                const row: Table.BodyRow<R> = node.data;
                if (
                  tabling.rows.isEditableRow(row) &&
                  (isNil(props.rowHasCheckboxSelection) || props.rowHasCheckboxSelection(row))
                ) {
                  node.setSelected(e.target.checked);
                }
              });
            }}
          />
        </Tooltip>
      ]}
    />
  );
};

export default React.memo(AuthenticatedMenu) as typeof AuthenticatedMenu;

import React from "react";

import UnauthenticatedToolbar from "./UnauthenticatedToolbar";
import Menu, { InternalMenuProps, MenuProps } from "./Menu";

export type UnauthenticatedMenuProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = Omit<
  MenuProps<Table.UnauthenticatedMenuActionParams<R, M>, R, M>,
  "menuActionParams" | "savingChangesPortalId" | "saving" | "savingVisible"
> & {
  readonly columns: Table.DataColumn<R, M>[];
};

type InternalUnathenticatedMenuProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = Omit<
  InternalMenuProps<Table.UnauthenticatedMenuActionParams<R, M>, R, M>,
  "menuActionParams" | "toolbar"
> & {
  readonly apis: Table.GridApis | null;
  readonly hiddenColumns?: Table.HiddenColumns;
  readonly columns: Table.DataColumn<R, M>[];
};

const UnathenticatedMenu = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: Omit<InternalUnathenticatedMenuProps<R, M>, "menuPortalId">
) => {
  return (
    <Menu<Table.UnauthenticatedMenuActionParams<R, M>, R, M>
      {...props}
      toolbar={UnauthenticatedToolbar}
      menuActionParams={{
        apis: props.apis,
        hiddenColumns: props.hiddenColumns,
        columns: props.columns
      }}
    />
  );
};

export default React.memo(UnathenticatedMenu) as typeof UnathenticatedMenu;

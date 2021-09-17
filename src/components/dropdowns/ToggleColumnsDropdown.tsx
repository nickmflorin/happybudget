import { useMemo } from "react";
import { filter, map, includes } from "lodash";

import Dropdown, { DropdownMenuItemsProps } from "./Dropdown";

type OmitDropdownProps = "menuMode" | "menuCheckbox" | "menuSelected" | "menuItems";
export interface ToggleColumnsDropdownProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
> extends Omit<DropdownMenuItemsProps, OmitDropdownProps> {
  readonly columns: Table.Column<R, M, G>[];
  readonly hiddenColumns?: (keyof R)[];
}

/* eslint-disable indent */
const ToggleColumnsDropdown = <
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group
>(
  props: ToggleColumnsDropdownProps<R, M, G>
): JSX.Element => {
  const hideableColumns = useMemo<Table.Column<R, M, G>[]>(
    () => filter(props.columns, (col: Table.Column<R, M, G>) => col.canBeHidden !== false),
    [props.columns]
  );

  const selected = useMemo<(keyof R)[]>(
    () =>
      map(
        filter(hideableColumns, (col: Table.Column<R, M, G>) => !includes(props.hiddenColumns, col.field)),
        (col: Table.Column<R, M, G>) => col.field
      ),
    [hideableColumns, props.hiddenColumns]
  );

  return (
    <Dropdown
      {...props}
      menuMode={"multiple"}
      includeSearch={true}
      searchIndices={["label"]}
      menuCheckbox={true}
      menuSelected={selected as string[]}
      keepDropdownOpenOnClick={true}
      menuItems={map(hideableColumns, (col: Table.Column<R, M, G>) => ({
        id: col.field as string,
        label: col.headerName || ""
      }))}
    />
  );
};

export default ToggleColumnsDropdown;

import React, { useEffect, useMemo, useState } from "react";

import { filter, map, isNil, reduce } from "lodash";

import DropdownMenu from "./DropdownMenu";

export interface ExportCSVDropdownMenuProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
> {
  readonly children: React.ReactChild | React.ReactChild[];
  readonly columns: Table.DataColumn<R, M>[];
  readonly onDownload: (ids: string[]) => void;
  readonly hiddenColumns?: Table.HiddenColumns;
}

const ExportCSVDropdownMenu = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
>(
  props: ExportCSVDropdownMenuProps<R, M>,
): JSX.Element => {
  const [selected, setSelected] = useState<string[]>([]);

  const exportableColumns = useMemo<Table.DataColumn<R, M>[]>(
    () => filter(props.columns, (col: Table.DataColumn<R, M>) => col.canBeExported !== false),
    [props.columns],
  );

  useEffect(() => {
    const exportable: Table.DataColumn<R, M>[] = filter(
      exportableColumns,
      (col: Table.DataColumn<R, M>) =>
        isNil(props.hiddenColumns) || props.hiddenColumns[col.field] !== true,
    );
    setSelected(map(exportable, (col: Table.DataColumn<R, M>) => col.field));
  }, [props.columns, props.hiddenColumns]);

  return (
    <DropdownMenu
      mode="multiple"
      checkbox={true}
      includeSearch={true}
      keepDropdownOpenOnClick={true}
      clientSearching={true}
      searchIndices={["label"]}
      setFocusedFromSelectedState={false}
      onChange={(e: MenuChangeEvent) => {
        const selectedIds: string[] = reduce(
          e.menuState,
          (curr: string[], s: MenuItemStateWithModel) => {
            if (s.selected === true) {
              return [...curr, String(s.model.id)];
            }
            return curr;
          },
          [],
        );
        setSelected(selectedIds);
      }}
      selected={selected}
      models={map(exportableColumns, (col: Table.DataColumn<R, M>) => ({
        id: col.field,
        label: col.headerName || "",
      }))}
      buttons={[
        {
          onClick: (e: MenuButtonClickEvent) => {
            const selectedIds: string[] = reduce(
              e.menuState,
              (curr: string[], s: MenuItemStateWithModel) => {
                if (s.selected === true) {
                  return [...curr, String(s.model.id)];
                }
                return curr;
              },
              [],
            );
            props.onDownload(selectedIds);
          },
          label: "Download",
          className: "btn btn--primary",
        },
      ]}
    >
      {props.children}
    </DropdownMenu>
  );
};

export default React.memo(ExportCSVDropdownMenu) as typeof ExportCSVDropdownMenu;

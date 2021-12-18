import React, { useEffect, useMemo, useState } from "react";
import { filter, map, isNil, reduce } from "lodash";

import { tabling } from "lib";
import DropdownMenu from "./DropdownMenu";

export interface ExportCSVDropdownProps<R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel> {
  readonly children: React.ReactChild | React.ReactChild[];
  readonly columns: Table.Column<R, M>[];
  readonly onDownload: (ids: string[]) => void;
  readonly hiddenColumns?: Table.HiddenColumns;
}

const ExportCSVDropdown = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: ExportCSVDropdownProps<R, M>
): JSX.Element => {
  const [selected, setSelected] = useState<(keyof R | string)[]>([]);

  const exportableColumns = useMemo<Table.Column<R, M>[]>(
    () =>
      filter(
        props.columns,
        (col: Table.Column<R, M>) =>
          col.canBeExported !== false &&
          col.tableColumnType !== "fake" &&
          !isNil(tabling.columns.normalizedField<R, M>(col))
      ),
    [props.columns]
  );

  useEffect(() => {
    const exportable: Table.Column<R, M>[] = filter(exportableColumns, (col: Table.Column<R, M>) => {
      const field: string | undefined = tabling.columns.normalizedField<R, M>(col);
      return !isNil(field) && (isNil(props.hiddenColumns) || props.hiddenColumns[field] !== true);
    });
    setSelected(
      filter(
        map(exportable, (col: Table.Column<R, M>) => tabling.columns.normalizedField<R, M>(col)),
        (field: keyof R | string | undefined) => !isNil(field)
      ) as (keyof R | string)[]
    );
  }, [props.columns, props.hiddenColumns]);

  return (
    <DropdownMenu
      mode={"multiple"}
      checkbox={true}
      includeSearch={true}
      keepDropdownOpenOnClick={true}
      clientSearching={true}
      searchIndices={["label"]}
      onChange={(e: MenuChangeEvent) => {
        const selectedIds: string[] = reduce(
          e.menuState,
          (curr: string[], s: MenuItemStateWithModel) => {
            if (s.selected === true) {
              return [...curr, String(s.model.id)];
            }
            return curr;
          },
          []
        );
        setSelected(selectedIds as (keyof R | string)[]);
      }}
      selected={selected as string[]}
      models={map(exportableColumns, (col: Table.Column<R, M>) => ({
        id: tabling.columns.normalizedField<R, M>(col) as string,
        label: col.headerName || ""
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
              []
            );
            props.onDownload(selectedIds);
          },
          label: "Download",
          className: "btn btn--primary"
        }
      ]}
    >
      {props.children}
    </DropdownMenu>
  );
};

export default React.memo(ExportCSVDropdown) as typeof ExportCSVDropdown;

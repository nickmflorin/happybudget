import React, { useMemo } from "react";
import { map, reduce, isNil, includes } from "lodash";
import classNames from "classnames";

import { AgGridReact, AgGridReactProps } from "@ag-grid-community/react";
import { AllModules, ColSpanParams } from "@ag-grid-enterprise/all-modules";
import { ColDef, EditableCallbackParams, CellClassParams, RowClassParams } from "@ag-grid-community/core";

import { TABLE_DEBUG } from "config";
import { tabling, hooks } from "lib";
import BaseFramework from "../framework";

type OmitAGGridProps =
  | "columnDefs"
  | "overlayNoRowsTemplate"
  | "overlayLoadingTemplate"
  | "modules"
  | "debug"
  | "suppressCopyRowsToClipboard"
  | "frameworkComponents"
  | "rowData"
  | "getRowClass"
  | "rowClass"
  | "modules";

type AGFramework = { [key: string]: React.ComponentType<any> };

export type CommonGridProps<R extends Table.Row, M extends Model.Model> = {
  readonly readOnly?: boolean;
  readonly indexColumnWidth?: number;
  readonly expandColumnWidth?: number;
  readonly hasExpandColumn: boolean;
  readonly columns: Table.Column<R, M>[];
};

export interface GridProps<R extends Table.Row, M extends Model.Model>
  extends StandardComponentProps,
    Omit<AgGridReactProps, OmitAGGridProps> {
  readonly id: Table.GridId;
  readonly data?: R[];
  readonly columns: Table.Column<R, M>[];
  readonly framework?: Table.Framework;
  readonly hiddenColumns: Table.Field<R, M>[];
  readonly rowClass?: Table.RowClassName;
  readonly onChangeEvent?: (event: Table.ChangeEvent<R, M>) => void;
}

const Grid = <R extends Table.Row, M extends Model.Model>({
  id,
  columns,
  data = [],
  framework,
  style,
  className,
  hiddenColumns,
  rowClass,
  onChangeEvent,
  ...props
}: GridProps<R, M>): JSX.Element => {
  const Framework = useMemo<AGFramework>((): AGFramework => {
    const combinedFramework = tabling.util.combineFrameworks(BaseFramework, framework);
    return {
      ...reduce(
        combinedFramework.cells?.[id],
        (prev: AGFramework, cell: React.ComponentType<any>, name: string) => ({ ...prev, [name]: cell }),
        {}
      ),
      ...reduce(
        combinedFramework.editors,
        (prev: AGFramework, editor: React.ComponentType<any>, name: string) => {
          return { ...prev, [name]: editor };
        },
        {}
      )
    };
  }, [framework, id]);

  const rowData = useMemo(
    () => map(data, (row: R) => ({ ...row, meta: { ...row.meta, gridId: id } })),
    [id, hooks.useDeepEqualMemo(data)]
  );

  const localColumns = useMemo<Table.Column<R, M>[]>((): Table.Column<R, M>[] => {
    return map(
      columns,
      (col: Table.Column<R, M>, index: number): Table.Column<R, M> =>
        ({
          ...col,
          headerComponentParams: { ...col.headerComponentParams, column: col },
          cellRendererParams: { ...col.cellRendererParams, columns, column: col, onChangeEvent },
          cellEditorParams: { ...col.cellEditorParams, columns, column: col },
          hide: includes(hiddenColumns, col.field),
          resizable: index === columns.length - 1 ? false : !isNil(col.resizable) ? col.resizable : true,
          cellStyle: { ...tabling.util.getColumnTypeCSSStyle(col.columnType), ...col.cellStyle }
        } as Table.Column<R, M>)
    );
  }, [hooks.useDeepEqualMemo(columns)]);

  const colDefs = useMemo(
    () =>
      map(localColumns, (col: Table.Column<R, M>): ColDef => {
        /*
        While AG Grid will not break if we include extra properties on the ColDef(s)
        (properties from our own custom Table.Column model) - they will complain a lot.
        So we need to try to remove them.
        */
        const {
          footer,
          page,
          selectable,
          isCalculated,
          isCalculating,
          index,
          canBeExported,
          canBeHidden,
          fieldBehavior,
          columnType,
          nullValue,
          refreshColumns,
          processCellForClipboard,
          processCellFromClipboard,
          getHttpValue,
          getModelValue,
          getRowValue,
          ...agColumn
        } = col;
        return {
          ...agColumn,
          field: col.field as string,
          suppressMenu: true,
          cellRenderer:
            /* eslint-disable indent */
            typeof col.cellRenderer === "string"
              ? col.cellRenderer
              : !isNil(col.cellRenderer)
              ? col.cellRenderer[id]
              : undefined,
          colSpan: (params: ColSpanParams) => (!isNil(col.colSpan) ? col.colSpan({ ...params, columns }) : 1),
          editable: (params: EditableCallbackParams) => {
            const row: R = params.node.data;
            /* eslint-disable indent */
            return isNil(col.editable)
              ? false
              : typeof col.editable === "function"
              ? col.editable({ row, column: col })
              : col.editable;
          },
          cellClass: (params: CellClassParams) => {
            const row: R = params.node.data;
            /* eslint-disable indent */
            const isSelectable = isNil(col.selectable)
              ? true
              : typeof col.selectable === "function"
              ? col.selectable({ row, column: col })
              : col.selectable;
            return tabling.util.mergeClassNames<CellClassParams>(params, "cell", col.cellClass, {
              "cell--not-selectable": isSelectable === false,
              "cell--not-editable": !(col.editable === true),
              "cell--calculated": col.isCalculated === true
            });
          }
        };
      }),
    [hooks.useDeepEqualMemo(localColumns)]
  );

  return (
    <div className={classNames("ag-theme-alpine", "grid", className)} style={style}>
      <AgGridReact
        rowHeight={36}
        headerHeight={38}
        allowContextMenuWithControlKey={true}
        cellFlashDelay={100}
        cellFadeDelay={500}
        suppressRowClickSelection={true}
        stopEditingWhenGridLosesFocus={true}
        enableRangeSelection={true}
        animateRows={true}
        enterMovesDown={false}
        immutableData={true}
        getRowNodeId={(r: any) => r.id}
        {...props}
        getRowClass={(params: RowClassParams) => tabling.util.mergeClassNames<RowClassParams>(params, "row", rowClass)}
        rowData={rowData}
        // Required to get processCellFromClipboard to work with column spanning.
        suppressCopyRowsToClipboard={true}
        columnDefs={colDefs}
        debug={process.env.NODE_ENV === "development" && TABLE_DEBUG}
        modules={AllModules}
        overlayNoRowsTemplate={"<span></span>"}
        overlayLoadingTemplate={"<span></span>"}
        frameworkComponents={Framework}
      />
    </div>
  );
};

export default Grid;

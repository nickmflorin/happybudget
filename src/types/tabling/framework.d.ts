declare namespace Table {
  type GridApi = import("@ag-grid-community/core").GridApi;
  type ColumnApi = import("@ag-grid-community/core").ColumnApi;
  type GridApis = {
    readonly grid: GridApi;
    readonly column: ColumnApi;
  };

  type FooterGridId = "footer" | "page";
  type GridId = "data" | FooterGridId;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type GridSet<T> = { [key in GridId]: T };

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type FooterGridSet<T> = { [key in FooterGridId]: T };

  type TableApiSet = GridSet<GridApis | null>;

  type FrameworkGroup = { [key: string]: React.ComponentType<any> };

  type GridFramework = {
    readonly editors?: FrameworkGroup;
    readonly cells?: FrameworkGroup;
  };

  type Framework = {
    readonly editors?: FrameworkGroup;
    readonly cells?: Partial<GridSet<FrameworkGroup>>;
  };

  interface ITableApis {
    readonly store: Partial<TableApiSet>;
    readonly get: (id: GridId) => GridApis | null;
    readonly set: (id: GridId, apis: GridApis) => void;
    readonly clone: () => ITableApis;
    readonly gridApis: GridApi[];
  }

  /* I really don't know why, but extending
		 import("@ag-grid-community/core").IEditorParams does not work here. */
  interface EditorParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    V = any
  > {
    readonly value: V | null;
    readonly keyPress: number | null;
    readonly charPress: string | null;
    readonly column: Column<R, M>;
    readonly columns: Column<R, M>[];
    readonly colDef: import("@ag-grid-community/core").ColDef;
    readonly node: import("@ag-grid-community/core").RowNode;
    readonly data: any;
    readonly rowIndex: number;
    readonly api: import("@ag-grid-community/core").GridApi | null | undefined;
    readonly columnApi: import("@ag-grid-community/core").ColumnApi | null | undefined;
    readonly cellStartedEdit: boolean;
    readonly context: any;
    readonly eGridCell: HTMLElement;
    readonly selector: (state: Application.Store) => S;
    readonly onKeyDown: (event: KeyboardEvent) => void;
    readonly stopEditing: (suppressNavigateAfterEdit?: boolean) => void;
    readonly parseValue: (value: any) => any;
    readonly formatValue: (value: any) => any;
    /* When the cell editor finishes editing, the AG Grid callback
			 (onCellDoneEditing) does not have any context about what event triggered
			 the completion, so we have to handle that ourselves so we can trigger
			 different behaviors depending on how the selection was performed. */
    readonly onDoneEditing: (e: Table.CellDoneEditingEvent) => void;
  }

  interface CellProps<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    V = any
  > extends Omit<import("@ag-grid-community/core").ICellRendererParams, "value">,
      StandardComponentProps {
    readonly loading?: boolean;
    readonly hideClear?: boolean;
    readonly customCol: Column<R, M>;
    readonly value: V;
    readonly gridId: GridId;
    readonly icon?: IconOrElement | ((row: BodyRow<R>) => IconOrElement | undefined | null);
    readonly innerCellClassName?: string | undefined | ((r: Table.Row<R>) => string | undefined);
    readonly innerCellStyle?: React.CSSProperties | undefined | ((r: Table.Row<R>) => React.CSSProperties | undefined);
    /* Note: This is only applied for the data grid rows/cells - so we have to
			 be careful.  We need a better way of establishing which props are
			 available to cells based on which grid they lie in. */
    readonly getRowColorDef: (row: BodyRow<R>) => RowColorDef;
    readonly selector: (state: Application.Store) => S;
    readonly onClear?: (row: BodyRow<R>, column: Column<R, M>) => void;
    readonly showClear?: (row: BodyRow<R>, column: Column<R, M>) => boolean;
    readonly onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    readonly onChangeEvent?: (event: Table.ChangeEvent<R, M>) => void;
  }

  type CellWithChildrenProps<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>
  > = Omit<CellProps<R, M, S>, "value"> & {
    readonly children: import("react").ReactNode;
  };

  type ValueCellProps<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>
  > = CellProps<R, M, S, string | number | null> & {
    /* This is used for extending cells.  Normally, the value formatter will be
			 included on the ColDef of the associated column.  But when extending a
			 Cell, we sometimes want to provide a formatter for that specific cell. */
    readonly valueFormatter?: AGFormatter;
  };
}

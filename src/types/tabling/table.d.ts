/// <reference path="../modeling/models.d.ts" />

declare namespace Table {
  type Name = "account-subaccounts" | "accounts" | "subaccount-subaccounts" | "fringes" | "actuals" | "contacts";
  type AsyncId = `async-${Name}-table`;

  type AgGridProps = import("@ag-grid-community/react/lib/interfaces").AgGridReactProps;

  type NativeFormatterParams<P extends string | number> = P | null;
  type AGFormatterParams = import("@ag-grid-community/core").ValueFormatterParams;

  type AGFormatter = (params: AGFormatterParams) => string;

  type NativeFormatter<P extends string | number> = (params: NativeFormatterParams<P>) => string;

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

  type GridOptions = import("@ag-grid-community/core").GridOptions;

  type TableOptionsSet = GridSet<import("@ag-grid-community/core").GridOptions>;

  type GeneralClassName = string | undefined | null;
  type RowClassParams = import("@ag-grid-community/core").RowClassParams;

  type GetRowStyle = (params: RowClassParams) => import("react").CSSProperties | null | undefined;

  type GetRowClassName = (params: RowClassParams) => RowClassName;

  type CellPosition = Omit<import("@ag-grid-community/core").CellPosition, "rowPinned">;

  type CellKeyDownEvent = import("@ag-grid-community/core").CellKeyDownEvent;

  type ColDef = import("@ag-grid-community/core").ColDef;

  type AgColumn = import("@ag-grid-community/core").Column;

  type RowNode = import("@ag-grid-community/core").RowNode;

  type MenuItemDef = import("@ag-grid-community/core").MenuItemDef | string;

  type GridReadyEvent = import("@ag-grid-community/core").GridReadyEvent;

  type FirstDataRenderedEvent = import("@ag-grid-community/core").FirstDataRenderedEvent;

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

  interface RowColorDef {
    readonly backgroundColor?: string;
    readonly color?: string;
  }

  type DataRowType = "placeholder" | "model";

  type EditableRowType = "model" | "markup";
  type BodyRowType = DataRowType | "group" | "markup";
  type RowType = BodyRowType | "footer";

  type ModelRowId = number;
  type FooterRowId = `footer-${FooterGridId}`;
  type PlaceholderRowId = `placeholder-${number}`;
  type GroupRowId = `group-${number}`;
  type MarkupRowId = `markup-${number}`;

  type DataRowId = ModelRowId | PlaceholderRowId;
  type EditableRowId = ModelRowId | MarkupRowId;
  type NonPlaceholderBodyRowId = EditableRowId | GroupRowId;
  type BodyRowId = NonPlaceholderBodyRowId | PlaceholderRowId;

  type RowId = BodyRowId | FooterRowId;

  type RowNameLabelType = number | string | null;

  type RowStringGetter<R extends Row> = RowNameLabelType | FnWithTypedArgs<RowNameLabelType, [R]>;

  type RowData = object;

  type IRow<RId extends RowId, TP extends RowType, Grid extends GridId = GridId> = {
    readonly id: RId;
    readonly rowType: TP;
    readonly gridId: Grid;
  };

  type IBodyRow<RId extends RowId, TP extends BodyRowType, D extends RowData> = IRow<RId, TP, "data"> & {
    readonly data: D;
  };

  type FooterRow<Grid extends FooterGridId = FooterGridId> = IRow<FooterRowId, "footer", Grid>;
  type ModelRow<R extends RowData> = IBodyRow<ModelRowId, "model", R> & {
    readonly children: number[];
    readonly order: string;
  };
  type PlaceholderRow<R extends RowData> = IBodyRow<PlaceholderRowId, "placeholder", R> & {
    readonly children: [];
  };
  type GroupRow<R extends RowData> = IBodyRow<GroupRowId, "group", R> & {
    readonly children: number[];
    readonly groupData: Pick<Model.Group, "name" | "color">;
  };
  type MarkupRow<R extends RowData> = IBodyRow<MarkupRowId, "markup", R> & {
    readonly children: number[];
    readonly markupData: Pick<Model.Markup, "unit" | "rate">;
  };

  type DataRow<D extends RowData> = ModelRow<D> | PlaceholderRow<D>;
  type EditableRow<D extends RowData> = ModelRow<D> | MarkupRow<D>;

  type NonPlaceholderBodyRow<D extends RowData> = ModelRow<D> | MarkupRow<D> | GroupRow<D>;

  type BodyRow<D extends RowData = RowData> = ModelRow<D> | PlaceholderRow<D> | GroupRow<D> | MarkupRow<D>;
  type Row<D extends RowData = RowData> = BodyRow<D> | FooterRow;

  type RowWithColor<D extends RowData = RowData> = BodyRow<D & { color: Style.HexColor | null }>;

  type RowWithName<D extends RowData = RowData> = BodyRow<D & { name: string | null }>;

  type RowWithDescription<D extends RowData = RowData> = BodyRow<D & { description: string | null }>;

  type RowWithIdentifier<D extends RowData = RowData> = BodyRow<D & { identifier: string | null }>;

  type CreateTableDataConfig<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly response: Http.TableResponse<M>;
    readonly columns: Column<R, M>[];
    readonly getModelRowChildren?: (m: M) => number[];
  };

  type ColumnTypeId =
    | "text"
    | "longText"
    | "singleSelect"
    | "phone"
    | "email"
    | "number"
    | "contact"
    | "currency"
    | "sum"
    | "percentage"
    | "file"
    | "date";

  type ColumnAlignment = "right" | "left" | null;
  type TableColumnTypeId = "action" | "body" | "calculated" | "fake";

  interface ColumnType {
    readonly id: ColumnTypeId;
    readonly style?: React.CSSProperties;
    readonly icon?: IconOrElement;
    readonly pdfOverrides?: Omit<Partial<ColumnType>, "id">;

    readonly headerOverrides?: Omit<Partial<ColumnType>, "id" | "icon" | "pdfOverrides">;
  }

  type CellCallbackParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly column: Column<R, M>;
    readonly row: BodyRow<R>;
  };

  type RawClassName = string | string[] | undefined | { [key: string]: boolean };
  type ClassNameParamCallback<T> = (params: T) => ClassName<T>;
  interface _CellClassNameArray<P> {
    [n: number]: RawClassName | ClassNameParamCallback<P>;
  }
  type ClassName<P> = RawClassName | ClassNameParamCallback<P> | _CellClassNameArray<P>;

  type CellClassName = ClassName<import("@ag-grid-community/core").CellClassParams>;
  type RowClassName = ClassName<import("@ag-grid-community/core").RowClassParams>;

  type ColSpanParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel
  > = import("@ag-grid-community/core").ColSpanParams & {
    readonly columns: Column<R, M>[];
  };

  type PdfCellCallbackParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any> = {
    readonly row?: Row<R>;
    readonly colIndex: number;
    readonly column: Column<R, M, V>;
    readonly isHeader: boolean;
    readonly rawValue: V | null;
    readonly value: string;
    readonly indented: boolean;
  };

  type PdfCellCallback<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any, RV = any> = (
    params: PdfCellCallbackParams<R, M, V>
  ) => RV;

  type PdfOptionalCellCallback<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    V = any,
    RV = any
  > = RV | PdfCellCallback<R, M, V> | undefined;

  interface _PdfCellClassName<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any> {
    [n: number]: PdfOptionalCellCallback<R, M, V, string> | _PdfCellClassName<R, M, V>;
  }
  type PdfCellClassName<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any> =
    | PdfOptionalCellCallback<R, M, V, string>
    | _PdfCellClassName<R, M, V>;

  interface _PdfCellStyle<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any> {
    [n: number]: PdfOptionalCellCallback<R, M, V, import("@react-pdf/types").Style> | _PdfCellStyle<R, M, V>;
  }
  type PdfCellStyle<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any> =
    | PdfOptionalCellCallback<R, M, V, import("@react-pdf/types").Style>
    | _PdfCellStyle<R, M, V>;

  type PdfCellStandardProps<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel, V = any> = {
    readonly style?: PdfCellStyle<R, M, V>;
    readonly className?: PdfCellClassName<R, M, V>;
    readonly textStyle?: PdfCellStyle<R, M, V>;
    readonly textClassName?: PdfCellClassName<R, M, V>;
  };

  interface PdfFooterColumn<V = any> {
    readonly value?: V | null;
    readonly textStyle?: import("@react-pdf/types").Style;
  }

  type PdfValueGetter<R extends RowData, V = any> = (r: BodyRow<R>, rows: BodyRow<R>[]) => V | null;
  type PdfFooterValueGetter<R extends RowData, V = any> = (rows: BodyRow<R>[]) => V | null;

  type OmitColDefParams =
    | "field"
    | "colId"
    | "headerName"
    | "cellRenderer"
    | "cellClass"
    | "getCellClass"
    | "colSpan"
    | "cellStyle"
    | "editable"
    | "valueGetter"
    | "onCellDoubleClicked";

  type ParsedColumnField<R extends RowData, V = any> = { field: keyof R; value: V };

  type FactoryFn<D> = (data: Partial<D>) => Column<any, any, any, any>;

  type InferFactoryParams<T> = T extends FactoryFn<infer D> ? D : never;

  type HiddenColumns = { [key: string]: boolean };

  type EditColumnRowConfig<
    R extends RowData,
    RW extends Table.NonPlaceholderBodyRow<R> = Table.NonPlaceholderBodyRow<R>
  > = {
    readonly conditional: (row: RW) => boolean;
    readonly hidden?: (row: RW, hovered: boolean) => boolean;
    readonly behavior: EditRowActionBehavior;
    readonly action: (row: any, hovered: boolean) => void;
    readonly tooltip?: string | ((row: RW, params: { hovered: boolean; disabled: boolean }) => string);
    readonly disabled?: boolean | ((row: RW, hovered: boolean) => boolean);
  };

  type PreviousValues<T> = [T, T] | [T];

  interface Column<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    V = any,
    PDFM extends Model.RowHttpModel = any
  > extends Omit<ColDef, OmitColDefParams> {
    readonly field?: keyof R;
    readonly colId?: string;
    readonly headerName?: string;
    readonly pdfHeaderName?: string;
    readonly columnType?: ColumnTypeId;
    readonly tableColumnType: TableColumnTypeId;
    readonly index?: number;
    readonly nullValue?: any;
    readonly selectable?: boolean | ((params: CellCallbackParams<R, M>) => boolean) | undefined;
    readonly editable?: boolean | ((params: CellCallbackParams<R, M>) => boolean);
    readonly footer?: FooterColumn<R, M>;
    readonly page?: FooterColumn<R, M>;
    readonly isRead?: boolean;
    readonly isWrite?: boolean;
    readonly cellRenderer?: string | Partial<GridSet<string>>;
    readonly cellClass?: CellClassName;
    readonly cellStyle?: React.CSSProperties;
    readonly defaultHidden?: boolean;
    readonly canBeHidden?: boolean;
    readonly canBeExported?: boolean;
    readonly requiresAuthentication?: boolean;
    readonly smartInference?: boolean;
    readonly defaultNewRowValue?: boolean;
    readonly valueGetter?: (row: Table.BodyRow<R>, rows: Table.BodyRow<R>[]) => any;
    readonly getRowValue?: (m: M) => R[keyof R];
    readonly getHttpValue?: (value: V) => any;
    readonly onDataChange?: (id: ModelRowId, event: Table.CellChange<R>) => void;
    readonly colSpan?: (params: ColSpanParams<R, M>) => number;
    readonly onCellFocus?: (params: CellFocusedParams<R, M>) => void;
    readonly onCellUnfocus?: (params: CellFocusedParams<R, M>) => void;
    readonly refreshColumns?: (change: CellChange<V>) => keyof R | (keyof R)[] | null;
    readonly parseIntoFields?: (value: V) => ParsedColumnField<R, V>[];
    readonly processCellForCSV?: (row: R) => string | number;
    readonly processCellForClipboard?: (row: R) => string | number;
    readonly processCellFromClipboard?: (value: string) => V | null;
    readonly onCellDoubleClicked?: (row: ModelRow<R>) => void;
    readonly includeInPdf?: boolean;
    /* In the PDF case, since we cannot dynamically resize columns, the width
			 refers to a ratio of the column width to the overall table width assuming
			 that all columns are present.  When columns are hidden/shown, this ratio
			 is adjusted. */
    readonly pdfWidth?: number;
    readonly pdfFlexGrow?: true;
    readonly pdfCellProps?: PdfCellStandardProps<R, PDFM, V>;
    readonly pdfHeaderCellProps?: PdfCellStandardProps<R, PDFM, V>;
    readonly pdfFooter?: PdfFooterColumn<V>;
    readonly pdfCellContentsVisible?: PdfOptionalCellCallback<R, PDFM, V, boolean>;
    readonly pdfFormatter?: (value: string | number) => string;
    readonly pdfValueGetter?: PdfValueGetter<R, V>;
    readonly pdfFooterValueGetter?: V | null | PdfFooterValueGetter<R, V>;
    readonly pdfCellRenderer?: (params: PdfCellCallbackParams<R, PDFM, V>) => JSX.Element;
    /* NOTE: This only applies for the individual Account tables, not the the
			 overall Accounts */
    readonly pdfChildFooter?: (s: PDFM) => PdfFooterColumn<V>;
  }

  type PdfColumn<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    V = any,
    MM extends Model.RowHttpModel = any
  > = Column<R, MM, V, M>;

  interface FooterColumn<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel>
    extends Pick<Column<R, M>, "colSpan"> {
    readonly cellStyle?: React.CSSProperties;
  }

  interface CookieNames {
    readonly hiddenColumns?: string;
  }

  type EditRowActionBehavior = "expand" | "edit";

  type DataGridInstance = {
    readonly getCSVData: (fields?: string[]) => CSVData;
  };

  type TableInstance<
    R extends RowData = RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel
  > = DataGridInstance & {
    readonly getFocusedRow: () => BodyRow<R> | null;
    readonly getRow: (id: BodyRowId) => BodyRow<R> | null;
    readonly getRows: () => BodyRow<R>[];
    readonly getRowsAboveAndIncludingFocusedRow: () => BodyRow<R>[];
    readonly applyTableChange: (event: SingleOrArray<Table.ChangeEvent<R, M>>) => void;
    readonly changeColumnVisibility: (changes: SingleOrArray<ColumnVisibilityChange>, sizeToFit?: boolean) => void;
  };

  type MenuActionObj = {
    readonly index?: number;
    readonly icon: IconOrElement;
    readonly tooltip?: Tooltip;
    readonly disabled?: boolean;
    readonly label?: string;
    readonly isWriteOnly?: boolean;
    // If being wrapped in a Dropdown, the onClick prop will not be used.
    readonly onClick?: () => void;
    readonly wrapInDropdown?: (children: import("react").ReactChild | import("react").ReactChild[]) => JSX.Element;
    readonly render?: RenderFunc;
  };

  type MenuActionParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly apis: GridApis;
    readonly columns: Column<R, M>[];
    readonly hiddenColumns?: HiddenColumns;
  };

  type UnauthenticatedMenuActionParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel
  > = MenuActionParams<R, M>;

  type AuthenticatedMenuActionParams<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel
  > = MenuActionParams<R, M> & {
    readonly selectedRows: EditableRow<R>[];
  };

  type MenuActionCallback<
    V,
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = (params: T) => V;
  type MenuAction<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = MenuActionObj | MenuActionCallback<MenuActionObj, R, M, T>;
  type MenuActions<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = Array<MenuAction<R, M, T>> | MenuActionCallback<MenuAction<R, M, T>[], R, M, T>;

  type UnauthenticatedMenuAction<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuAction<
    R,
    M,
    UnauthenticatedMenuActionParams<R, M>
  >;

  type AuthenticatedMenuAction<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuAction<
    R,
    M,
    AuthenticatedMenuActionParams<R, M>
  >;

  type UnauthenticatedMenuActions<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuActions<
    R,
    M,
    UnauthenticatedMenuActionParams<R, M>
  >;

  type AuthenticatedMenuActions<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = MenuActions<
    R,
    M,
    AuthenticatedMenuActionParams<R, M>
  >;

  interface ColumnVisibilityChange {
    readonly field: string;
    readonly visible: boolean;
  }

  type Cell<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly row: BodyRow<R>;
    readonly column: Column<R, M>;
    readonly rowNode: import("@ag-grid-community/core").RowNode;
  };

  type CellFocusedParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly cell: Cell<R, M>;
    readonly apis: GridApis;
  };

  type CellFocusChangedParams<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly cell: Cell<R, M>;
    readonly previousCell: Cell<R, M> | null;
    readonly apis: GridApis;
  };

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

  type RowDataSelector<R extends RowData> = (state: Application.Store) => Partial<R>;

  interface DataGridConfig<R extends RowData> {
    readonly refreshRowExpandColumnOnCellHover?: (row: Row<R>) => boolean;
  }

  type AuthenticatedDataGridConfig<R extends RowData> = DataGridConfig<R> & {
    readonly rowCanDelete?: (row: EditableRow<R>) => boolean;
    readonly includeRowInNavigation?: (row: EditableRow<R>) => boolean;
  };

  type UnauthenticatedDataGridConfig<R extends RowData> = {
    readonly includeRowInNavigation?: (row: EditableRow<R>) => boolean;
  };

  type FooterGridConfig<R extends RowData, M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly id: "page" | "footer";
    readonly rowClass: RowClassName;
    readonly className: GeneralClassName;
    readonly rowHeight?: number;
    readonly getFooterColumn: (column: Column<R, M>) => FooterColumn<R, M> | null;
  };

  type TaskConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>
  > = Redux.TaskConfig<A> & {
    readonly columns: Column<R, M>[];
  };

  type ReducerConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>,
    CFG extends CreateTableDataConfig<R, M> = CreateTableDataConfig<R, M>
  > = TaskConfig<R, M, A> &
    Omit<CFG, "gridId" | "response"> & {
      readonly initialState: S;
      readonly defaultData?: Partial<R>;
      readonly createTableRows?: (config: CFG) => BodyRow<R>[];
      readonly getModelRowChildren?: (m: M) => number[];
      readonly clearOn: import("@reduxjs/toolkit").PayloadActionCreator<any>[];
    };

  type SagaConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>
  > = Redux.SagaConfig<Redux.TableTaskMap<R, M>, A>;

  type StoreConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    A extends Redux.TableActionMap<M> & { readonly request?: Redux.TableRequestPayload } = Redux.TableActionMap<M> & {
      readonly request?: Redux.TableRequestPayload;
    }
  > = {
    readonly autoRequest?: boolean;
    readonly asyncId?: AsyncId;
    readonly actions: Redux.ActionMapObject<A>;
    readonly selector?: (state: Application.Store) => S;
    readonly footerRowSelectors?: Partial<FooterGridSet<RowDataSelector<R>>>;
    readonly reducer?: Redux.Reducer<S>;
  };
}

declare namespace PdfBudgetTable {
  // Either the TopSheet page or an ID of the account.
  type TableOption = "topsheet" | number;

  type HeaderOptions = {
    readonly header: Pdf.HTMLNode[];
    readonly left_image: UploadedImage | SavedImage | null;
    readonly left_info: Pdf.HTMLNode[] | null;
    readonly right_image: UploadedImage | SavedImage | null;
    readonly right_info: Pdf.HTMLNode[] | null;
  };

  interface Options {
    readonly header: HeaderOptions;
    readonly columns: string[];
    readonly tables?: TableOption[] | null | undefined;
    readonly excludeZeroTotals: boolean;
    readonly notes?: Pdf.HTMLNode[];
    readonly includeNotes: boolean;
  }
}

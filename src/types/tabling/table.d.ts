/// <reference path="../modeling/models.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Table {
  type Name = "account-subaccounts" | "accounts" | "subaccount-subaccounts" | "fringes" | "actuals" | "contacts";
  type Id = `${Name}-table`;
  type AsyncId = `async-${Id}`;

  type AgGridProps = import("@ag-grid-community/react/lib/interfaces").AgGridReactProps;

  type NullValue<R extends Table.RowData> = R[keyof R];
  type ValueFormatter = (params: import("@ag-grid-community/core").ValueFormatterParams) => string | number | null;

  type GridApi = import("@ag-grid-community/core").GridApi;
  type ColumnApi = import("@ag-grid-community/core").ColumnApi;
  type GridApis = {
    readonly grid: GridApi;
    readonly column: ColumnApi;
  };

  type FooterGridId = "footer" | "page";
  type GridId = "data" | "footer" | "page";
  type GridSet<T> = { [key in GridId]: T };
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
  type MenuItemDef = import("@ag-grid-community/core").MenuItemDef;
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

  type RowType = "placeholder" | "model" | "group" | "markup";

  type ModelRowId = number;
  type PlaceholderRowId = `placeholder-${number}`;
  type GroupRowId = `group-${number}`;
  type MarkupRowId = `markup-${number}`;
  type RowId = ModelRowId | PlaceholderRowId | GroupRowId | MarkupRowId;
  type DataRowId = ModelRowId | PlaceholderRowId;
  type EditableRowId = DataRowId | MarkupRowId;
  type HttpEditableRowId = ModelRowId | MarkupRowId;

  type RowNameLabelType = number | string | null;
  type RowStringGetter<R extends Table.Row> = RowNameLabelType | FnWithTypedArgs<RowNameLabelType, [R]>;

  type RowData = object;
  type RowValue<R extends RowData> = Exclude<R[keyof R], undefined>;

  type IRow<RId extends RowId, TP extends RowType, D extends RowData, Grid extends GridId = GridId> = {
    readonly id: RId;
    readonly rowType: TP;
    readonly gridId: Grid;
    readonly data: D;
  };

  type ModelRow<R extends RowData, M extends Model.HttpModel = Model.HttpModel, Grid extends GridId = GridId> = IRow<
    ModelRowId,
    "model",
    R,
    Grid
  > & {
    readonly children: number[];
    readonly modelData: Omit<M, "id" | "children">;
  };
  type PlaceholderRow<R extends RowData> = IRow<PlaceholderRowId, "placeholder", R, "data">;
  type GroupRow<R extends RowData> = IRow<GroupRowId, "group", R, "data"> & {
    readonly children: number[];
    readonly groupData: Pick<Model.Group, "name" | "color">;
  };
  type MarkupRow<R extends RowData> = IRow<MarkupRowId, "markup", R, "data"> & {
    readonly children: number[];
    readonly markupData: Pick<Model.Markup, "unit" | "rate">;
  };

  type Row<D extends RowData = object, M extends Model.HttpModel = Model.HttpModel> =
    | ModelRow<D, M>
    | PlaceholderRow<D>
    | GroupRow<D>
    | MarkupRow<D>;

  type DataRow<D extends RowData, M extends Model.HttpModel = Model.HttpModel> = ModelRow<D, M> | PlaceholderRow<D>;
  type NonGroupRow<D extends RowData, M extends Model.HttpModel = Model.HttpModel> = DataRow<D, M> | MarkupRow<D>;
  type NonMarkupRow<D extends RowData, M extends Model.HttpModel = Model.HttpModel> = DataRow<D, M> | GroupRow<D>;

  type EditableRow<D extends RowData, M extends Model.HttpModel = Model.HttpModel> =
    | ModelRow<D, M>
    | PlaceholderRow<D>
    | MarkupRow<D>;
  type HttpEditableRow<D extends RowData, M extends Model.HttpModel = Model.HttpModel> =
    | ModelRow<D, M>
    | MarkupRow<D>;
  type EditableNonDataRow<D extends RowData> = MarkupRow<D>;
  type EditableRowType = "model" | "placeholder" | "markup";

  type CreateRowDataConfig<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = {
    readonly columns: Table.AnyColumn<R, M>[];
    readonly defaultNullValue?: NullValue<R>;
    readonly getValue: (field: keyof R, col: Table.AnyColumn<R, M>) => R[keyof R] | undefined;
  };

  type UpdateRowDataConfig<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = Omit<
    CreateRowDataConfig<R, M>,
    "getValue"
  > & {
    readonly data: R;
    readonly update?: Partial<R>;
    readonly getValue: (field: keyof R, curr: R[keyof R], col: Table.AnyColumn<R, M>) => R[keyof R] | undefined;
  };

  type CreateRowConfig<
    RId extends Table.RowId,
    TP extends Table.RowType,
    R extends Table.RowData,
    M extends Model.HttpModel = Model.HttpModel,
    Grid extends GridId = GridId
  > = Omit<CreateRowDataConfig<R, M>, "getValue"> & {
    readonly id: RId;
    readonly rowType: TP;
    readonly data: R;
    readonly gridId: Grid;
  };

  type CreateTableDataConfig<
    R extends Table.RowData,
    M extends Model.TypedHttpModel = Model.TypedHttpModel,
    C extends Table.AnyColumn<R, M> = Table.AnyColumn<R, M>
  > = {
    readonly response: Http.TableResponse<M>;
    readonly gridId: Table.GridId;
    readonly columns: C[];
    readonly defaultNullValue?: NullValue<R>;
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
    | "date"
    | "fake"
    | "action";

  type ColumnAlignment = "right" | "left" | null;
  type TableColumnTypeId = "action" | "body" | "calculated" | "fake";

  interface ColumnType {
    readonly id: ColumnTypeId;
    readonly style?: React.CSSProperties;
    readonly icon?: IconOrElement;
    readonly editorIsPopup?: boolean;
    readonly pdfOverrides?: Omit<Partial<ColumnType>, "id" | "editorIsPopup">;
    readonly headerOverrides?: Omit<Partial<ColumnType>, "id" | "editorIsPopup" | "icon" | "pdfOverrides">;
  }

  type CellCallbackParams<R extends RowData, M extends Model.HttpModel = Model.HttpModel> = {
    readonly column: Column<R, M>;
    readonly row: Table.Row<R, M>;
  };

  type RawClassName = string | string[] | undefined | { [key: string]: boolean };
  type ClassNameParamCallback<T> = (params: T) => RawClassName;
  interface _CellClassNameArray<P> {
    [n: number]: RawClassName | ClassNameParamCallback<P>;
  }
  type ClassName<P> = RawClassName | ClassNameParamCallback<P> | _CellClassNameArray<P>;

  type CellClassName = ClassName<import("@ag-grid-community/core").CellClassParams>;
  type RowClassName = ClassName<import("@ag-grid-community/core").RowClassParams>;

  type ColSpanParams<
    R extends RowData,
    M extends Model.HttpModel = Model.HttpModel
  > = import("@ag-grid-community/core").ColSpanParams & {
    readonly columns: Column<R, M>[];
  };

  type ColumnDomain = "pdf" | "aggrid";

  // Column Type for Both PDF and AG Grid Tables
  interface BaseColumn<R extends RowData, M extends Model.HttpModel = Model.HttpModel> {
    readonly field?: keyof R;
    readonly headerName: string;
    readonly columnType: ColumnTypeId;
    readonly tableColumnType: TableColumnTypeId;
    readonly nullValue?: NullValue<R>;
    readonly index?: number;
    readonly domain: ColumnDomain;
    readonly getRowValue?: (m: M) => R[keyof R];
    readonly getMarkupValue?: keyof Model.Markup | ((rows: Table.NonGroupRow<R, M>[]) => R[keyof R]);
    readonly getGroupValue?: keyof Model.Group | ((rows: Table.NonGroupRow<R, M>[]) => R[keyof R]);
  }

  type OmitColDefParams =
    | "field"
    | "headerName"
    | "cellRenderer"
    | "cellClass"
    | "getCellClass"
    | "colSpan"
    | "cellStyle"
    | "editable"
    | "onCellDoubleClicked";

  interface Column<R extends RowData, M extends Model.HttpModel = Model.HttpModel, V extends RowValue<R> = any>
    extends Omit<ColDef, OmitColDefParams>,
      Omit<BaseColumn<R, M>, "domain"> {
    readonly domain: "aggrid";
    readonly selectable?: boolean | ((params: CellCallbackParams<R, M>) => boolean) | undefined;
    readonly editable?: boolean | ((params: CellCallbackParams<R, M>) => boolean);
    readonly footer?: FooterColumn<R, M>;
    readonly page?: FooterColumn<R, M>;
    readonly isRead?: boolean;
    readonly isWrite?: boolean;
    readonly isFake?: boolean;
    readonly cellRenderer?: string | Partial<GridSet<string>>;
    readonly cellClass?: CellClassName;
    readonly cellStyle?: React.CSSProperties;
    readonly defaultHidden?: boolean;
    readonly canBeHidden?: boolean;
    readonly canBeExported?: boolean;
    readonly requiresAuthentication?: boolean;
    readonly colSpan?: (params: ColSpanParams<R, M>) => number;
    readonly onCellFocus?: (params: CellFocusedParams<R, M>) => void;
    readonly onCellUnfocus?: (params: CellFocusedParams<R, M>) => void;
    readonly refreshColumns?: (change: CellChange<R, V>) => keyof R | (keyof R)[] | null;
    readonly getHttpValue?: (value: any) => any;
    readonly processCellForClipboard?: (row: R) => string;
    readonly processCellFromClipboard?: (value: string) => any;
    readonly onCellDoubleClicked?: (row: Table.DataRow<R, M>) => void;
  }

  type AnyColumn<R extends RowData, M extends Model.HttpModel = Model.HttpModel> = Column<R, M> | PdfTable.Column<R, M>;

  interface FooterColumn<R extends RowData, M extends Model.HttpModel = Model.HttpModel>
    extends Pick<Column<R, M>, "colSpan"> {
    readonly cellStyle?: React.CSSProperties;
  }

  interface CookieNames {
    readonly hiddenColumns?: string;
  }

  type TableInstance<R extends RowData = object, M extends Model.HttpModel = any> = {
    readonly getFocusedRow: () => Table.Row<R, M> | null;
    readonly getRowsAboveAndIncludingFocusedRow: () => Table.Row<R, M>[];
    readonly applyTableChange: (event: ChangeEvent<R, M>) => void;
    readonly applyGroupColorChange: (group: Model.Group) => void;
    readonly getCSVData: (fields?: string[]) => CSVData;
    readonly changeColumnVisibility: (changes: SingleOrArray<ColumnVisibilityChange<R>>, sizeToFit?: boolean) => void;
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
    readonly wrapInDropdown?: (children: ReactNode) => JSX.Element;
    readonly render?: RenderFunc;
  };

  type MenuActionParams<R extends RowData, M extends Model.HttpModel = Model.HttpModel> = {
    readonly apis: GridApis;
    readonly columns: Column<R, M>[];
    readonly hiddenColumns: (keyof R | string)[];
  };
  type UnauthenticatedMenuActionParams<
    R extends RowData,
    M extends Model.HttpModel = Model.HttpModel
  > = MenuActionParams<R, M>;
  type AuthenticatedMenuActionParams<R extends RowData, M extends Model.HttpModel = Model.HttpModel> = MenuActionParams<
    R,
    M
  > & {
    readonly selectedRows: Table.DataRow<R, M>[];
  };

  type MenuActionCallback<
    V,
    R extends RowData,
    M extends Model.HttpModel = Model.HttpModel,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = (params: T) => V;
  type MenuAction<
    R extends RowData,
    M extends Model.HttpModel = Model.HttpModel,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = MenuActionObj | MenuActionCallback<MenuActionObj, R, M, T>;
  type MenuActions<
    R extends RowData,
    M extends Model.HttpModel = Model.HttpModel,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = Array<MenuAction<R, M, T>> | MenuActionCallback<MenuAction<R, M, T>[], R, M, T>;

  type UnauthenticatedMenuAction<R extends RowData, M extends Model.HttpModel = Model.HttpModel> = MenuAction<
    R,
    M,
    UnauthenticatedMenuActionParams<R, M>
  >;
  type AuthenticatedMenuAction<R extends RowData, M extends Model.HttpModel = Model.HttpModel> = MenuAction<
    R,
    M,
    AuthenticatedMenuActionParams<R, M>
  >;
  type UnauthenticatedMenuActions<R extends RowData, M extends Model.HttpModel = Model.HttpModel> = MenuActions<
    R,
    M,
    UnauthenticatedMenuActionParams<R, M>
  >;
  type AuthenticatedMenuActions<R extends RowData, M extends Model.HttpModel = Model.HttpModel> = MenuActions<
    R,
    M,
    AuthenticatedMenuActionParams<R, M>
  >;

  interface ColumnVisibilityChange<R extends RowData> {
    readonly field: keyof R | string;
    readonly visible: boolean;
  }

  type Cell<R extends RowData, M extends Model.HttpModel = Model.HttpModel> = {
    readonly row: Table.Row<R, M>;
    readonly column: Column<R, M>;
    readonly rowNode: import("@ag-grid-community/core").RowNode;
  };

  type CellFocusedParams<R extends RowData, M extends Model.HttpModel = Model.HttpModel> = {
    readonly cell: Cell<R, M>;
    readonly apis: GridApis;
  };

  type CellFocusChangedParams<R extends RowData, M extends Model.HttpModel = Model.HttpModel> = {
    readonly cell: Cell<R, M>;
    readonly previousCell: Cell<R, M> | null;
    readonly apis: GridApis;
  };

  type ChangeEventId =
    | "dataChange"
    | "rowAdd"
    | "rowDelete"
    | "rowRemoveFromGroup"
    | "rowAddToGroup"
    | "groupUpdate"
    | "groupAdd"
    | "rowRemoveFromMarkup"
    | "rowAddToMarkup"
    | "markupAdd"
    | "markupUpdate";

  type BaseChangeEvent = {
    readonly type: ChangeEventId;
  };

  type CellChange<R extends RowData, V extends RowValue<R> = RowValue<R>> = {
    readonly oldValue: V | null;
    readonly newValue: V | null;
  };

  type CellAdd<R extends RowData, V extends RowValue<R> = RowValue<R>> = {
    readonly value: V | null;
    readonly row: Table.PlaceholderRow<R>;
  };

  type SoloCellChange<
    R extends RowData,
    M extends Model.HttpModel,
    RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>,
    V extends RowValue<R> = RowValue<R>
  > = CellChange<R, V> & {
    readonly field: keyof R;
    readonly id: RW["id"];
    readonly row: RW;
  };

  type RowChangeData<R extends RowData> = Partial<{ [Property in keyof R]-?: CellChange<R, RowValue<R>> }>;

  type RowChange<
    R extends RowData,
    M extends Model.HttpModel,
    RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
  > = {
    readonly id: RW["id"];
    readonly row: RW;
    readonly data: RowChangeData<R>;
  };

  type RowAddData<R extends RowData> = Partial<{ [Property in keyof R]-?: CellAdd<R, RowValue<R>> }>;

  type RowAdd<R extends RowData> = {
    readonly id: Table.PlaceholderRowId;
    readonly data: RowAddData<R>;
  };

  type Add<R extends RowData> = RowAdd<R> | RowAdd<R>[];

  type DataChangePayload<
    R extends RowData,
    M extends Model.HttpModel,
    RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
  > = RowChange<R, M, RW> | RowChange<R, M, RW>[];

  type ConsolidatedChange<
    R extends RowData,
    M extends Model.HttpModel,
    RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
  > = RowChange<R, M, RW>[];

  type DataChangeEvent<
    R extends RowData,
    M extends Model.HttpModel,
    RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
  > = {
    readonly type: "dataChange";
    readonly payload: DataChangePayload<R, M, RW>;
  };

  type RowAddPayload<R extends RowData> = RowAdd<R> | RowAdd<R>[];
  type RowAddEvent<R extends RowData> = {
    readonly type: "rowAdd";
    readonly payload: RowAddPayload<R>;
  };

  type RowDeletePayload = {
    readonly rows: SingleOrArray<ModelRowId | MarkupRowId | GroupRowId | PlaceholderRowId>;
  };
  type RowDeleteEvent = {
    readonly type: "rowDelete";
    readonly payload: RowDeletePayload;
  };

  type RowRemoveFromGroupPayload = {
    readonly rows: SingleOrArray<ModelRowId>;
    readonly group: GroupRowId;
  };
  type RowRemoveFromGroupEvent = {
    readonly type: "rowRemoveFromGroup";
    readonly payload: RowRemoveFromGroupPayload;
  };

  type RowRemoveFromMarkupPayload = {
    readonly rows: SingleOrArray<ModelRowId>;
    readonly markup: MarkupRowId;
  };
  type RowRemoveFromMarkupEvent = {
    readonly type: "rowRemoveFromMarkup";
    readonly payload: RowRemoveFromMarkupPayload;
  };

  type RowAddToGroupPayload = {
    readonly group: GroupRowId;
    readonly rows: SingleOrArray<ModelRowId>;
  };
  type RowAddToGroupEvent = {
    readonly type: "rowAddToGroup";
    readonly payload: RowAddToGroupPayload;
  };

  type RowAddToMarkupPayload = {
    readonly markup: MarkupRowId;
    readonly rows: SingleOrArray<ModelRowId>;
  };
  type RowAddToMarkupEvent = {
    readonly type: "rowAddToMarkup";
    readonly payload: RowAddToMarkupPayload;
  };

  type GroupAddPayload = Model.Group;
  type GroupAddEvent = {
    readonly type: "groupAdd";
    readonly payload: GroupAddPayload;
  };

  type MarkupAddPayload = Model.Markup;
  type MarkupAddEvent = {
    readonly type: "markupAdd";
    readonly payload: MarkupAddPayload;
  };

  type GroupUpdatePayload = Redux.UpdateActionPayload<Model.Group, number>;
  type GroupUpdateEvent = {
    readonly type: "groupUpdate";
    readonly payload: GroupUpdatePayload;
  };

  type MarkupUpdatePayload = Redux.UpdateActionPayload<Model.Markup>;
  type MarkupUpdateEvent = {
    readonly type: "markupUpdate";
    readonly payload: MarkupUpdatePayload;
  };

  type ChangeEventTypeMap<
    R extends RowData,
    M extends Model.HttpModel = Model.HttpModel,
    RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
  > = {
    dataChange: DataChangeEvent<R, M, RW>;
    rowAdd: RowAddEvent<R>;
    rowDelete: RowDeleteEvent;
    rowRemoveFromGroup: RowRemoveFromGroupEvent;
    rowAddToGroup: RowAddToGroupEvent;
    groupAdd: GroupAddEvent;
    groupUpdate: GroupUpdateEvent;
    markupAdd: MarkupAddEvent;
    markupUpdate: MarkupUpdateEvent;
    rowAddToMarkup: RowAddToMarkupEvent;
    rowRemoveFromMarkup: RowRemoveFromMarkupEvent;
  };

  type ChangeEventTaskMap<R extends RowData, M extends Model.HttpModel = Model.HttpModel> = Redux.TaskMapObject<
    ChangeEventTypeMap<R, M>
  >;

  type FullRowEvent = RowDeleteEvent | RowRemoveFromGroupEvent | RowAddToGroupEvent;

  type GroupEvent = RowRemoveFromGroupEvent | RowAddToGroupEvent | GroupUpdateEvent | GroupAddEvent;

  type ChangeEvent<
    R extends RowData,
    M extends Model.HttpModel,
    RW extends Table.EditableRow<R, M> = Table.EditableRow<R, M>
  > =
    | DataChangeEvent<R, M, RW>
    | RowAddEvent<R>
    | RowDeleteEvent
    | RowRemoveFromGroupEvent
    | RowAddToGroupEvent
    | GroupAddEvent
    | GroupUpdateEvent
    | RowRemoveFromMarkupEvent
    | RowAddToMarkupEvent
    | MarkupAddEvent
    | MarkupUpdateEvent;

  type CellDoneEditingEvent = import("react").SyntheticEvent | KeyboardEvent;

  // I really don't know why, but extending import("@ag-grid-community/core").IEditorParams
  // does not work here.
  interface EditorParams<
    R extends RowData,
    M extends Model.HttpModel = Model.HttpModel,
    S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>,
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
    // When the cell editor finishes editing, the AG Grid callback (onCellDoneEditing)
    // does not have any context about what event triggered the completion, so we have
    // to handle that ourselves so we can trigger different behaviors depending on
    // how the selection was performed.
    readonly onDoneEditing: (e: CellDoneEditingEvent) => void;
  }

  interface CellProps<
    R extends RowData,
    M extends Model.HttpModel = Model.HttpModel,
    S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>,
    V = any
  > extends Omit<import("@ag-grid-community/core").ICellRendererParams, "value">,
      StandardComponentProps {
    readonly loading?: boolean;
    readonly hideClear?: boolean;
    readonly customCol: Column<R, M>;
    readonly value: V;
    readonly gridId: Table.GridId;
    readonly icon?: IconOrElement | ((row: Table.Row<R, M>) => IconOrElement | undefined | null);
    // Note: This is only applied for the data grid rows/cells - so we have to be careful.  We need
    // a better way of establishing which props are available to cells based on which grid they lie
    // in,
    readonly getRowColorDef: (row: Table.Row<R, M>) => Table.RowColorDef;
    readonly selector: (state: Application.Store) => S;
    readonly onClear?: (row: Table.Row<R, M>, column: Column<R, M>) => void;
    readonly showClear?: (row: Table.Row<R, M>, column: Column<R, M>) => boolean;
    readonly onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    readonly onChangeEvent?: (event: ChangeEvent<R, M>) => void;
  }

  type CellWithChildrenProps<
    R extends RowData,
    M extends Model.HttpModel = Model.HttpModel,
    S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
  > = Omit<CellProps<R, M, S>, "value"> & {
    readonly children: import("react").ReactNode;
  };

  type ValueCellProps<
    R extends RowData,
    M extends Model.HttpModel = Model.HttpModel,
    S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
  > = CellProps<R, M, S, string | number | null> & {
    // This is used for extending cells.  Normally, the value formatter will be included on the ColDef
    // of the associated column.  But when extending a Cell, we sometimes want to provide a formatter
    // for that specific cell.
    readonly valueFormatter?: ValueFormatter;
  };

  type RowDataSelector<R extends Table.RowData> = (state: Application.Store) => Partial<R>;

  type TaskConfig<
    R extends RowData,
    M extends Model.HttpModel = Model.HttpModel,
    A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>
  > = Redux.TaskConfig<A> & {
    readonly columns: Table.Column<R, M>[];
  };

  type ReducerConfig<
    R extends RowData,
    M extends Model.TypedHttpModel = Model.TypedHttpModel,
    S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>,
    A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>,
    CFG extends CreateTableDataConfig<R, M, Table.Column<R, M>> = CreateTableDataConfig<R, M, Table.Column<R, M>>
  > = TaskConfig<R, M, A> &
    Omit<CFG, "gridId" | "response"> & {
      readonly initialState: S;
      readonly tableId: Table.Id;
      readonly createTableRows?: (config: CFG) => Table.Row<R, M>[];
    };

  type SagaConfig<
    R extends RowData,
    M extends Model.HttpModel = Model.HttpModel,
    A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>
  > = Redux.SagaConfig<Redux.TableTaskMap<R, M>, A>;

  type StoreConfig<
    R extends RowData,
    M extends Model.HttpModel = Model.HttpModel,
    S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>,
    A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>
  > = {
    readonly autoRequest?: boolean;
    readonly asyncId?: Table.AsyncId;
    readonly actions: Redux.ActionMapObject<A>;
    readonly selector?: (state: Application.Store) => S;
    readonly footerRowSelectors?: Partial<FooterGridSet<RowDataSelector<R>>>;
    readonly reducer?: Redux.Reducer<S>;
  };
}

namespace PdfTable {
  type CellLocation = { index: number; colIndex: number };

  type CellCallbackParams<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = {
    readonly location: PdfTable.CellLocation;
    readonly column: PdfTable.Column<R, M>;
    readonly row: Table.Row<R, M>;
    readonly isHeader: boolean;
    readonly rawValue: any;
    readonly value: any;
    readonly indented: boolean;
  };

  type CellCallback<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = any> = (
    params: PdfTable.CellCallbackParams<R, M>
  ) => V;

  type OptionalCellCallback<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel, V = any> =
    | V
    | CellCallback<R, M, V>
    | undefined;

  interface _CellClassName<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> {
    [n: number]: OptionalCellCallback<R, M, string> | _CellClassName<R, M>;
  }
  type CellClassName<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> =
    | OptionalCellCallback<R, M, string>
    | _CellClassName<R, M>;

  interface _CellStyle<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> {
    [n: number]: OptionalCellCallback<R, M, import("@react-pdf/types").Style> | _CellStyle<R, M>;
  }
  type CellStyle<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> =
    | OptionalCellCallback<R, M, import("@react-pdf/types").Style>
    | _CellStyle<R, M>;

  type CellStandardProps<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel> = {
    readonly style?: CellStyle<R, M>;
    readonly className?: CellClassName<R, M>;
    readonly textStyle?: CellStyle<R, M>;
    readonly textClassName?: CellClassName<R, M>;
  };

  interface FooterColumn {
    readonly value?: any;
    readonly textStyle?: import("@react-pdf/types").Style;
  }

  type Formatter = (value: string | number) => string;

  interface Column<R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>
    extends Omit<Table.BaseColumn<R, M>, "domain"> {
    readonly domain: "pdf";
    // In the PDF case, since we cannot dynamically resize columns, the width refers to a ratio
    // of the column width to the overall table width assuming that all columns are present.  When
    // columns are hidden/shown, this ratio is adjusted.
    readonly width: number;
    readonly cellProps?: CellStandardProps<R, M>;
    readonly headerCellProps?: CellStandardProps<R, M>;
    readonly footer?: FooterColumn;
    readonly cellContentsVisible?: OptionalCellCallback<R, M, boolean>;
    readonly formatter?: PdfTable.Formatter;
    readonly cellRenderer?: (params: PdfTable.CellCallbackParams<R, M>) => JSX.Element;
    // NOTE: This only applies for the individual Account tables, not gf the overall
    // Accounts table.
    readonly childFooter?: (s: M) => FooterColumn;
  }
}

namespace PdfBudgetTable {
  // Either the TopSheet page or an ID of the account.
  type TableOption = "topsheet" | number;

  interface Options {
    readonly header: Omit<HeaderTemplateFormData, "name">;
    readonly columns: (keyof Tables.PdfSubAccountRowData)[];
    readonly tables?: TableOption[] | null | undefined;
    readonly excludeZeroTotals: boolean;
    readonly notes?: RichText.Block[];
    readonly includeNotes: boolean;
  }
}

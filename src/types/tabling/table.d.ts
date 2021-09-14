/// <reference path="../modeling/models.d.ts" />
/// <reference path="./ui.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Table {
  type Name = "account-subaccounts" | "accounts" | "subaccount-subaccounts" | "fringes" | "actuals" | "contacts";
  type Id = `${Name}-table`;
  type AsyncId = `async-${Id}`

  type AgGridProps = import("@ag-grid-community/react/lib/interfaces").AgGridReactProps;

  type NullValue = null | "" | 0 | [];
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

  type BaseRowMeta = {
    readonly name?: string | number | null;
    readonly label?: string | number | null;
  };

  type ModelRowMeta<M extends Model.Model = Model.Model> = BaseRowMeta & {
    readonly children: ID[] | null;
    readonly model: M;
    readonly gridId: GridId;
  };

  type PlaceholderRowMeta = Omit<BaseRowMeta, "gridId"> & {
    readonly gridId: "data";
  };

  type GroupRowMeta = Omit<BaseRowMeta, "gridId"> & {
    readonly gridId: "data";
    readonly group: ID;
    readonly children: DataRowID[];
  };

  type RowMeta<M extends Model.Model = Model.Model> = ModelRowMeta<M> | PlaceholderRowMeta | GroupRowMeta;

  type RowType = "placeholder" | "model" | "group";
  type PlaceholderRowId = `placeholder-${ID}`;
  type GroupRowId = `group-${ID}`;
  type RowID = ID | PlaceholderRowId | GroupRowId;
  type DataRowID = ID | PlaceholderRowId;
  type RowData = object;
  type RowValue<R extends RowData> = Exclude<R[keyof R], undefined>;

  type IRow<RowId extends RowID, TP extends RowType, D extends RowData, E extends BaseRowMeta> = D & {
    readonly id: RowId;
    readonly meta: E;
    readonly rowType: TP;
  }
  type Row<D extends RowData, M extends Model.Model = Model.Model> = ModelRow<D, M> | PlaceholderRow<D> | GroupRow<D>;
  type DataRow<D extends RowData, M extends Model.Model = Model.Model> = ModelRow<D, M> | PlaceholderRow<D>;

  type PlaceholderRow<D extends RowData> = IRow<PlaceholderRowId, "placeholder", D, PlaceholderRowMeta>;
  type GroupRow<R extends RowData> = IRow<GroupRowId, "group", D, GroupRowMeta>;
  type ModelRow<D extends RowData, M extends Model.Model = Model.Model> =IRow<ID, "model", D, ModelRowMeta<M>>;

  type ModelWithRow<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly row: ModelRow<R, M>;
    readonly model: M;
  };

  interface RowGroup<R extends RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group> {
    readonly rows: ModelWithRow<R, M>[];
    readonly group?: G | null;
  }

  type TableData<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = RowGroup<R, M, G>[];

  type RowNameLabelType = number | string | null;
  type RowStringGetter<ARGS extends any[]> = RowNameLabelType | FnWithTypedArgs<RowNameLabelType, ARGS>;

  type CreateRowConfig<ARGS extends any[], R extends Table.RowData, M extends Model.Model = Model.Model> = {
    readonly columns: Table.AnyColumn<R, M>[];
    readonly defaultNullValue?: Table.NullValue;
    // Because these will not necessarily update when the underlying row changes,
    // we should probably remove these from the row meta.
    readonly getRowName?: RowStringGetter<ARGS>;
    readonly getRowLabel?: RowStringGetter<ARGS>;
  };

  type CreateModelRowConfig<
    R extends Table.RowData,
    M extends Model.Model = Model.Model
  > = CreateRowConfig<[R, M], R, M> & {
    readonly data: R;
    readonly gridId: Table.GridId;
    readonly model: M;
    readonly getRowChildren?: (m: M) => ID[];
  };

  type CreatePlaceholderRowConfig<
    R extends Table.RowData,
    M extends Model.Model = Model.Model
  > = CreateRowConfig<[R], R, M> & {
    readonly id: Table.PlaceholderRowId;
    readonly data: R;
  };

  type CreateGroupRowConfig<
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = CreateRowConfig<[G], R, M> & {
    readonly group: G;
  };

  type CreateTableDataConfig<
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = {
    readonly ordering?: FieldOrder<keyof R>[];
    readonly groups?: G[];
    readonly models: M[];

    readonly columns: Table.AnyColumn<R, M>[];
    readonly defaultNullValue?: Table.NullValue;
    readonly getModelRowChildren?: (m: M) => ID[];

    // Because these will not necessarily update when the underlying row changes,
    // we should probably remove these from the row meta.
    readonly getModelRowLabel?: RowStringGetter<[R, M]>;
    readonly getGroupRowLabel?: RowStringGetter<[G | null]>;
    readonly getPlaceholderRowLabel?: RowStringGetter<[R]>;

    // Because these will not necessarily update when the underlying row changes,
    // we should probably remove these from the row meta.
    readonly getModelRowName?: RowStringGetter<[R, M]>;
    readonly getGroupRowName?: RowStringGetter<[G | null]>;
    readonly getPlaceholderRowName?: RowStringGetter<[R]>;
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
    | "action";

  type ColumnAlignment = "right" | "left" | null;
  type TableColumnTypeId = "action" | "body" | "calculated";

  interface ColumnType {
    readonly id: ColumnTypeId;
    readonly style?: React.CSSProperties;
    readonly icon?: IconOrElement;
    readonly editorIsPopup?: boolean;
    readonly pdfOverrides?: Omit<Partial<ColumnType>, "id" | "editorIsPopup">;
    readonly headerOverrides?: Omit<Partial<ColumnType>, "id" | "editorIsPopup" | "icon" | "pdfOverrides">;
  }

  type CellCallbackParams<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly column: Column<R, M>;
    readonly row: R;
  };

  type RawClassName = string | string[] | undefined | { [key: string]: boolean };
  type ClassNameParamCallback<T> = (params: T) => RawClassName;
  interface _CellClassNameArray<P> {
    [n: number]: RawClassName | ClassNameParamCallback<P>;
  }
  type ClassName<P> = RawClassName | ClassNameParamCallback<P> | _CellClassNameArray<P>;

  type CellClassName = ClassName<import("@ag-grid-community/core").CellClassParams>;
  type RowClassName = ClassName<import("@ag-grid-community/core").RowClassParams>;

  type ColSpanParams<R extends RowData, M extends Model.Model = Model.Model> = import("@ag-grid-community/core").ColSpanParams & {
    readonly columns: Column<R, M>[];
  };

  type ColumnDomain = "pdf" | "aggrid";

  // Column Type for Both PDF and AG Grid Tables
  interface BaseColumn<R extends RowData, M extends Model.Model = Model.Model> {
    readonly field: keyof R;
    readonly headerName: string;
    readonly columnType: ColumnTypeId;
    readonly tableColumnType: TableColumnTypeId;
    readonly nullValue?: NullValue;
    readonly index?: number;
    readonly domain: ColumnDomain;
    readonly applicableForGroup?: boolean;
    readonly getRowValue?: (m: M) => R[keyof R];
  }

  type OmitColDefParams = "field" | "headerName" | "cellRenderer" | "cellClass" | "getCellClass" | "colSpan";

  interface Column<
    R extends RowData,
    M extends Model.Model = Model.Model,
    V extends RowValue<R> = any
  > extends Omit<ColDef, OmitColDefParams>,
      Omit<BaseColumn<R, M>, "domain"> {
    readonly domain: "aggrid";
    readonly selectable?: boolean | ((params: CellCallbackParams<R, M>) => boolean) | undefined;
    readonly editable?: boolean | ((params: CellCallbackParams<R, M>) => boolean) | undefined;
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
    readonly colSpan?: (params: ColSpanParams<R, M>) => number;
    readonly onCellFocus?: (params: CellFocusedParams<R, M>) => void;
    readonly onCellUnfocus?: (params: CellFocusedParams<R, M>) => void;
    readonly refreshColumns?: (change: SoloCellChange<R, M, V>) => keyof R | (keyof R)[] | null;
    readonly getModelValue?: (row: Table.ModelRow<R>) => M[keyof M];
    readonly getHttpValue?: (value: any) => any;
    readonly processCellForClipboard?: (row: R) => string;
    readonly processCellFromClipboard?: (value: string) => any;
    readonly onCellDoubleClicked?: (row: Table.DataRow<R, M>) => void;
  }

  type AnyColumn<R extends RowData, M extends Model.Model = Model.Model> = Column<R, M> | PdfTable.Column<R, M>;

  interface FooterColumn<R extends RowData, M extends Model.Model = Model.Model>
    extends Pick<Column<R, M>, "colSpan"> {
    readonly cellStyle?: React.CSSProperties;
  }

  interface CookieNames {
    readonly ordering?: string;
    readonly hiddenColumns?: string;
  }

  type TableInstance<
    R extends RowData = any,
    M extends Model.Model = any,
    G extends Model.Group = Model.Group
  > = {
    readonly applyTableChange: (event: ChangeEvent<R, M, G>) => void;
    readonly applyGroupColorChange: (group: G) => void;
    readonly getCSVData: (fields?: string[]) => CSVData;
    readonly changeColumnVisibility: (changes: SingleOrArray<ColumnVisibilityChange<R, M>>, sizeToFit?: boolean) => void;
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

  type MenuActionParams<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly apis: GridApis;
    readonly columns: Column<R, M>[];
    readonly hiddenColumns: (keyof R)[];
  };
  type UnauthenticatedMenuActionParams<R extends RowData, M extends Model.Model = Model.Model> = MenuActionParams<R, M>;
  type AuthenticatedMenuActionParams<R extends RowData, M extends Model.Model = Model.Model> = MenuActionParams<
    R,
    M
  > & {
    readonly selectedRows: Table.DataRow<R, M>[];
  };

  type MenuActionCallback<
    V,
    R extends RowData,
    M extends Model.Model = Model.Model,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = (params: T) => V;
  type MenuAction<
    R extends RowData,
    M extends Model.Model = Model.Model,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = MenuActionObj | MenuActionCallback<MenuActionObj, R, M, T>;
  type MenuActions<
    R extends RowData,
    M extends Model.Model = Model.Model,
    T extends MenuActionParams<R, M> = MenuActionParams<R, M>
  > = Array<MenuAction<R, M, T>> | MenuActionCallback<MenuAction<R, M, T>[], R, M, T>;

  type UnauthenticatedMenuAction<R extends RowData, M extends Model.Model = Model.Model> = MenuAction<
    R,
    M,
    UnauthenticatedMenuActionParams<R, M>
  >;
  type AuthenticatedMenuAction<R extends RowData, M extends Model.Model = Model.Model> = MenuAction<
    R,
    M,
    AuthenticatedMenuActionParams<R, M>
  >;
  type UnauthenticatedMenuActions<R extends RowData, M extends Model.Model = Model.Model> = MenuActions<
    R,
    M,
    UnauthenticatedMenuActionParams<R, M>
  >;
  type AuthenticatedMenuActions<R extends RowData, M extends Model.Model = Model.Model> = MenuActions<
    R,
    M,
    AuthenticatedMenuActionParams<R, M>
  >;

  interface ColumnVisibilityChange<R extends RowData> {
    readonly field: keyof R;
    readonly visible: boolean;
  }

  type Cell<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly row: Table.Row<R, M>;
    readonly column: Column<R, M>;
    readonly rowNode: import("@ag-grid-community/core").RowNode;
  };

  type CellFocusedParams<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly cell: Cell<R, M>;
    readonly apis: GridApis;
  };

  type CellFocusChangedParams<R extends RowData, M extends Model.Model = Model.Model> = {
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
   | "groupAdd";

  type BaseChangeEvent = {
    readonly type: ChangeEventId;
  };

  type CellChange<
    R extends RowData,
    M extends Model.Model = Model.Model,
    V extends RowValue<R> = RowValue<R>
  > = {
    readonly oldValue: V | null;
    readonly newValue: V | null;
    readonly row: Table.Row<R, M>;
  };

  type CellAdd<
    R extends RowData,
    M extends Model.Model = Model.Model,
    V extends RowValue<R> = RowValue<R>
  > = {
    readonly value: V | null;
    readonly row: Table.PlaceholderRow<R>;
  };

  type SoloCellChange<
    R extends RowData,
    M extends Model.Model = Model.Model,
    V extends RowValue<R> = RowValue<R>
  > = CellChange<R, M, V> & {
    readonly field: keyof R;
    readonly id: Table.DataRowID;
  };

  type RowChangeData<R extends RowData, M extends Model.Model = Model.Model> = Partial<
    { [Property in keyof R]-?: CellChange<R, M, RowValue<R>> }
  >;

  type RowChange<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly id: Table.RowID;
    readonly data: RowChangeData<R, M>;
  };

  type RowAddData<R extends RowData, M extends Model.Model = Model.Model> = Partial<
    { [Property in keyof R]-?: CellAdd<R, M, RowValue<R>> }
  >;

  type RowAdd<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly id: Table.PlaceholderRowId;
    readonly data: RowAddData<R, M>;
  };

  type Add<R extends RowData, M extends Model.Model = Model.Model> = RowAdd<R, M> | RowAdd<R, M>[];

  type DataChangePayload<R extends RowData, M extends Model.Model = Model.Model> = RowChange<R, M> | RowChange<R, M>[];

  type ConsolidatedChange<R extends RowData, M extends Model.Model = Model.Model> = RowChange<R, M>[];

  type DataChangeEvent<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly type: "dataChange";
    readonly payload: DataChangePayload<R, M>;
  };

  type RowAddPayload<R extends RowData, M extends Model.Model = Model.Model> = RowAdd<R, M> | RowAdd<R, M>[];
  type RowAddEvent<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly type: "rowAdd";
    readonly payload: RowAddPayload<R, M>;
    readonly artificial?: boolean;
  };

  type RowDeletePayload<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly rows: RowID[] | RowID;
  };
  type RowDeleteEvent<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly type: "rowDelete";
    readonly payload: RowDeletePayload<R, M>;
  };

  type RowRemoveFromGroupPayload<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly rows: DataRowID[] | DataRowID;
    readonly group: GroupRowId;
  };
  type RowRemoveFromGroupEvent<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly type: "rowRemoveFromGroup";
    readonly payload: RowRemoveFromGroupPayload<R, M>;
  };

  type RowAddToGroupPayload<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly group: GroupRowId;
    readonly rows: DataRowID[] | DataRowID;
  };
  type RowAddToGroupEvent<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly type: "rowAddToGroup";
    readonly payload: RowAddToGroupPayload<R, M>;
  };

  type GroupAddPayload<G extends Model.Group = Model.Group> = G;
  type GroupAddEvent<G extends Model.Group = Model.Group> = BaseChangeEvent & {
    readonly type: "groupAdd";
    readonly payload: GroupAddPayload<G>;
  };

  type GroupUpdatePayload<G extends Model.Group = Model.Group> = Redux.UpdateActionPayload<G>;
  type GroupUpdateEvent<G extends Model.Group = Model.Group> = BaseChangeEvent & {
    readonly type: "groupUpdate";
    readonly payload: GroupUpdatePayload<G>;
  };

  type FullRowEvent<R extends RowData, M extends Model.Model = Model.Model> =
    | RowDeleteEvent<R, M>
    | RowRemoveFromGroupEvent<R, M>
    | RowAddToGroupEvent<R, M>;

  type GroupEvent<R extends RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group> =
    | RowRemoveFromGroupEvent<R, M>
    | RowAddToGroupEvent<R, M>
    | GroupUpdateEvent<G>
    | GroupAddEvent<G>;

  type ChangeEvent<R extends RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group> =
    | DataChangeEvent<R, M>
    | RowAddEvent<R, M>
    | RowDeleteEvent<R, M>
    | RowRemoveFromGroupEvent<R, M>
    | RowAddToGroupEvent<R, M>
    | GroupAddEvent<G>
    | GroupUpdateEvent<G>;

  type CellDoneEditingEvent = import("react").SyntheticEvent | KeyboardEvent;

  // I really don't know why, but extending import("@ag-grid-community/core").IEditorParams
  // does not work here.
  interface EditorParams<
    R extends RowData,
    M extends Model.Model = Model.Model,
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
    M extends Model.Model = Model.Model,
    S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>,
    V = any
  > extends Omit<import("@ag-grid-community/core").ICellRendererParams, "value">,
      StandardComponentProps {
    readonly loading?: boolean;
    readonly hideClear?: boolean;
    readonly customCol: Column<R, M>;
    readonly value: V;
    readonly gridId: Table.GridId;
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
    M extends Model.Model = Model.Model,
    S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
  > = Omit<CellProps<R, M, S>, "value"> & {
    readonly children: import("react").ReactNode;
  };

  type ValueCellProps<
    R extends RowData,
    M extends Model.Model = Model.Model,
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
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    A extends Redux.TableActionMap<M, G> = Redux.TableActionMap<M, G>
  > = Redux.TaskConfig<A> & {
    readonly columns: Table.Column<R, M>[];
  }

  type ReducerConfig<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>,
    A extends Redux.TableActionMap<M, G> = Redux.TableActionMap<M, G>
  > = TaskConfig<R, M, G, A> & Omit<CreateTableDataConfig<R, M, G>, "models" | "groups" | "columns"> & {
    readonly initialState: S;
    readonly tableId: Table.Id;
  }

  type SagaConfig<
    R extends RowData,
    M extends Model.Model = Model.Model,
    T extends Redux.TableTaskMap<R, M> = Redux.TableTaskMap<R, M>,
    A extends Redux.TableActionMap<M, G> = Redux.TableActionMap<M, G>
  > = Redux.SagaConfig<T, A>;

  type StoreConfig<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>,
    A extends Redux.TableActionMap<M, G> = Redux.TableActionMap<M, G>
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

  type CellCallbackParams<R extends Table.RowData, M extends Model.Model = Model.Model> = {
    readonly location: PdfTable.CellLocation;
    readonly column: PdfTable.Column<R, M>;
    readonly row: Table.Row<R, M>;
    readonly isHeader: boolean;
    readonly rawValue: any;
    readonly value: any;
    readonly indented: boolean;
  };

  type CellCallback<R extends Table.RowData, M extends Model.Model = Model.Model, V = any> = (
    params: PdfTable.CellCallbackParams<R, M>
  ) => V;
  type OptionalCellCallback<R extends Table.RowData, M extends Model.Model = Model.Model, V = any> =
    | V
    | PdfTable.CellCallback<R, M, V>
    | undefined;

  interface _CellClassName<R extends Table.RowData, M extends Model.Model = Model.Model> {
    [n: number]: OptionalCellCallback<R, M, string> | _CellClassName<R, M>;
  }
  type CellClassName<R extends Table.RowData, M extends Model.Model = Model.Model> =
    | OptionalCellCallback<R, M, string>
    | _CellClassName<R, M>;

  interface _CellStyle<R extends Table.RowData, M extends Model.Model = Model.Model> {
    [n: number]: OptionalCellCallback<R, M, import("@react-pdf/types").Style> | _CellStyle<R, M>;
  }
  type CellStyle<R extends Table.RowData, M extends Model.Model = Model.Model> =
    | OptionalCellCallback<R, M, import("@react-pdf/types").Style>
    | _CellStyle<R, M>;

  type CellStandardProps<R extends Table.RowData, M extends Model.Model = Model.Model> = {
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

  interface Column<R extends Table.RowData, M extends Model.Model = Model.Model>
    extends Omit<Table.BaseColumn<R, M>, "domain"> {
    readonly domain: "pdf";
    // In the PDF case, since we cannot dynamically resize columns, the width refers to a ratio
    // of the column width to the overall table width assuming that all columns are present.  When
    // columns are hidden/shown, this ratio is adjusted.
    readonly width: number;
    readonly cellProps?: CellStandardProps<R, M>;
    readonly headerCellProps?: CellStandardProps<R, M>;
    readonly footer?: FooterColumn;
    readonly cellContentsVisible?: PdfTable.OptionalCellCallback<R, boolean>;
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
    readonly columns: (keyof Tables.PdfSubAccountRow)[];
    readonly tables?: TableOption[] | null | undefined;
    readonly excludeZeroTotals: boolean;
    readonly notes?: RichText.Block[];
    readonly includeNotes: boolean;
  }
}

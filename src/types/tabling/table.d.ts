/// <reference path="../modeling/models.d.ts" />

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Table {
  type Name = "account-subaccounts" | "accounts" | "subaccount-subaccounts" | "fringes" | "actuals" | "contacts";
  type Id = `${Name}-table`;
  type AsyncId = `async-${Id}`;

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

  type RowType = "placeholder" | "model" | "group";

  type PlaceholderRowId = `placeholder-${ID}`;
  type GroupRowId = `group-${ID}`;
  type RowID = ID | PlaceholderRowId | GroupRowId;
  type DataRowID = ID | PlaceholderRowId;

  type RowData = object;
  type RowValue<R extends RowData> = Exclude<R[keyof R], undefined>;

  type IRow<RowId extends RowID, TP extends RowType, D extends RowData, Grid extends GridId = GridId> = {
    readonly id: RowId;
    readonly rowType: TP;
    readonly group: ID | null;
    readonly gridId: Grid;
    readonly data: D;
    readonly name?: string | number | null;
    readonly label?: string | number | null;
  };

  type ModelRow<D extends RowData, M extends Model.Model = Model.Model> = IRow<ID, "model", D> & {
    readonly children: ID[] | null;
    readonly model: M;
  };
  type PlaceholderRow<R extends RowData> = IRow<PlaceholderRowId, "placeholder", R, "data">;
  type GroupRow<R extends RowData> = Omit<IRow<GroupRowId, "group", R, "data">, "group"> & {
    readonly group: ID;
    readonly children: ID[];
    readonly color: string | null;
    readonly name: string | null;
  };

  type Row<D extends RowData, M extends Model.Model = Model.Model> = ModelRow<D, M> | PlaceholderRow<D> | GroupRow<D>;
  type DataRow<D extends RowData, M extends Model.Model = Model.Model> = ModelRow<D, M> | PlaceholderRow<D>;

  type RowNameLabelType = number | string | null;
  type RowStringGetter<ARGS extends any[]> = RowNameLabelType | FnWithTypedArgs<RowNameLabelType, ARGS>;

  type CreateRowConfig<
    ARGS extends any[],
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = {
    readonly columns: Table.AnyColumn<R, M, G>[];
    readonly defaultNullValue?: Table.NullValue;
    // Because these will not necessarily update when the underlying row changes,
    // we should probably remove these from the row meta.
    readonly getRowName?: RowStringGetter<ARGS>;
    readonly getRowLabel?: RowStringGetter<ARGS>;
    readonly group: ID | null;
    readonly gridId: Table.GridId;
  };

  type CreateModelRowConfig<R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group> = CreateRowConfig<
    [R, M],
    R,
    M,
    G
  > & {
    readonly data: R;
    readonly model: M;
    readonly getRowChildren?: (m: M) => ID[];
  };

  type CreatePlaceholderRowConfig<R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group> = Omit<
    CreateRowConfig<[R], R, M, G>,
    "gridId"
  > & {
    readonly id: Table.PlaceholderRowId;
    readonly data: R;
  };

  type CreateGroupRowConfig<
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = Omit<CreateRowConfig<[G], R, M, G>, "group" | "gridId"> & {
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

    readonly columns: Table.AnyColumn<R, M, G>[];
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

  type CellCallbackParams<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = {
    readonly column: Column<R, M, G>;
    readonly row: Table.DataRow<R, M>;
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
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = import("@ag-grid-community/core").ColSpanParams & {
    readonly columns: Column<R, M, G>[];
  };

  type ColumnDomain = "pdf" | "aggrid";

  // Column Type for Both PDF and AG Grid Tables
  interface BaseColumn<R extends RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group> {
    readonly field: keyof R;
    readonly headerName: string;
    readonly columnType: ColumnTypeId;
    readonly tableColumnType: TableColumnTypeId;
    readonly nullValue?: NullValue;
    readonly index?: number;
    readonly domain: ColumnDomain;
    // If provided, this column will populate the values for Group Rows based on this field on the Group.
    readonly groupField?: keyof G;
    // If provided, this column will populate the values for teh Group Rows based on the same field
    // as this column, so as long as groupField is not provided.
    readonly applicableForGroup?: boolean;
    readonly getRowValue?: (m: M) => R[keyof R];
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

  interface Column<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    V extends RowValue<R> = any
  > extends Omit<ColDef, OmitColDefParams>,
      Omit<BaseColumn<R, M, G>, "domain"> {
    readonly domain: "aggrid";
    readonly selectable?: boolean | ((params: CellCallbackParams<R, M, G>) => boolean) | undefined;
    readonly editable?: boolean | ((params: CellCallbackParams<R, M, G>) => boolean) | undefined;
    readonly footer?: FooterColumn<R, M, G>;
    readonly page?: FooterColumn<R, M, G>;
    readonly isRead?: boolean;
    readonly isWrite?: boolean;
    readonly cellRenderer?: string | Partial<GridSet<string>>;
    readonly cellClass?: CellClassName;
    readonly cellStyle?: React.CSSProperties;
    readonly defaultHidden?: boolean;
    readonly canBeHidden?: boolean;
    readonly canBeExported?: boolean;
    readonly requiresAuthentication?: boolean;
    readonly colSpan?: (params: ColSpanParams<R, M, G>) => number;
    readonly onCellFocus?: (params: CellFocusedParams<R, M, G>) => void;
    readonly onCellUnfocus?: (params: CellFocusedParams<R, M, G>) => void;
    readonly refreshColumns?: (change: SoloCellChange<R, V>) => keyof R | (keyof R)[] | null;
    readonly getHttpValue?: (value: any) => any;
    readonly processCellForClipboard?: (row: R) => string;
    readonly processCellFromClipboard?: (value: string) => any;
    readonly onCellDoubleClicked?: (row: Table.DataRow<R, M>) => void;
  }

  type AnyColumn<R extends RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group> =
    | Column<R, M, G>
    | PdfTable.Column<R, M, G>;

  interface FooterColumn<R extends RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group>
    extends Pick<Column<R, M, G>, "colSpan"> {
    readonly cellStyle?: React.CSSProperties;
  }

  interface CookieNames {
    readonly ordering?: string;
    readonly hiddenColumns?: string;
  }

  type TableInstance<R extends RowData = any, M extends Model.Model = any, G extends Model.Group = Model.Group> = {
    readonly applyTableChange: (event: ChangeEvent<R, M, G>) => void;
    readonly applyGroupColorChange: (group: G) => void;
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

  type MenuActionParams<R extends RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group> = {
    readonly apis: GridApis;
    readonly columns: Column<R, M, G>[];
    readonly hiddenColumns: (keyof R)[];
  };
  type UnauthenticatedMenuActionParams<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = MenuActionParams<R, M, G>;
  type AuthenticatedMenuActionParams<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = MenuActionParams<R, M, G> & {
    readonly selectedRows: Table.DataRow<R, M>[];
  };

  type MenuActionCallback<
    V,
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    T extends MenuActionParams<R, M, G> = MenuActionParams<R, M, G>
  > = (params: T) => V;
  type MenuAction<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    T extends MenuActionParams<R, M, G> = MenuActionParams<R, M, G>
  > = MenuActionObj | MenuActionCallback<MenuActionObj, R, M, G, T>;
  type MenuActions<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    T extends MenuActionParams<R, M, G> = MenuActionParams<R, M, G>
  > = Array<MenuAction<R, M, G, T>> | MenuActionCallback<MenuAction<R, M, G, T>[], R, M, G, T>;

  type UnauthenticatedMenuAction<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = MenuAction<R, M, G, UnauthenticatedMenuActionParams<R, M, G>>;
  type AuthenticatedMenuAction<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = MenuAction<R, M, G, AuthenticatedMenuActionParams<R, M, G>>;
  type UnauthenticatedMenuActions<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = MenuActions<R, M, G, UnauthenticatedMenuActionParams<R, M, G>>;
  type AuthenticatedMenuActions<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = MenuActions<R, M, G, AuthenticatedMenuActionParams<R, M, G>>;

  interface ColumnVisibilityChange<R extends RowData> {
    readonly field: keyof R;
    readonly visible: boolean;
  }

  type Cell<R extends RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group> = {
    readonly row: Table.Row<R, M>;
    readonly column: Column<R, M, G>;
    readonly rowNode: import("@ag-grid-community/core").RowNode;
  };

  type CellFocusedParams<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = {
    readonly cell: Cell<R, M, G>;
    readonly apis: GridApis;
  };

  type CellFocusChangedParams<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = {
    readonly cell: Cell<R, M, G>;
    readonly previousCell: Cell<R, M, G> | null;
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
    V extends RowValue<R> = RowValue<R>
  > = CellChange<R, V> & {
    readonly field: keyof R;
    readonly id: Table.DataRowID;
  };

  type RowChangeData<R extends RowData, M extends Model.Model = Model.Model> = Partial<
    { [Property in keyof R]-?: CellChange<R, RowValue<R>> }
  >;

  type RowChange<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly id: Table.RowID;
    readonly data: RowChangeData<R, M>;
  };

  type RowAddData<R extends RowData> = Partial<{ [Property in keyof R]-?: CellAdd<R, RowValue<R>> }>;

  type RowAdd<R extends RowData> = {
    readonly id: Table.PlaceholderRowId;
    readonly data: RowAddData<R>;
  };

  type Add<R extends RowData> = RowAdd<R> | RowAdd<R>[];

  type DataChangePayload<R extends RowData, M extends Model.Model = Model.Model> = RowChange<R, M> | RowChange<R, M>[];

  type ConsolidatedChange<R extends RowData, M extends Model.Model = Model.Model> = RowChange<R, M>[];

  type DataChangeEvent<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly type: "dataChange";
    readonly payload: DataChangePayload<R, M>;
  };

  type RowAddPayload<R extends RowData> = RowAdd<R> | RowAdd<R>[];
  type RowAddEvent<R extends RowData> = {
    readonly type: "rowAdd";
    readonly payload: RowAddPayload<R>;
    readonly artificial?: boolean;
  };

  type RowDeletePayload<R extends RowData, M extends Model.Model = Model.Model> = {
    readonly rows: SingleOrArray<Table.Row<R, M>>;
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
    | RowAddEvent<R>
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
    G extends Model.Group = Model.Group,
    S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>,
    V = any
  > {
    readonly value: V | null;
    readonly keyPress: number | null;
    readonly charPress: string | null;
    readonly column: Column<R, M, G>;
    readonly columns: Column<R, M, G>[];
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
    G extends Model.Group = Model.Group,
    S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>,
    V = any
  > extends Omit<import("@ag-grid-community/core").ICellRendererParams, "value">,
      StandardComponentProps {
    readonly loading?: boolean;
    readonly hideClear?: boolean;
    readonly customCol: Column<R, M, G>;
    readonly value: V;
    readonly gridId: Table.GridId;
    // Note: This is only applied for the data grid rows/cells - so we have to be careful.  We need
    // a better way of establishing which props are available to cells based on which grid they lie
    // in,
    readonly getRowColorDef: (row: Table.Row<R, M>) => Table.RowColorDef;
    readonly selector: (state: Application.Store) => S;
    readonly onClear?: (row: Table.Row<R, M>, column: Column<R, M, G>) => void;
    readonly showClear?: (row: Table.Row<R, M>, column: Column<R, M, G>) => boolean;
    readonly onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    readonly onChangeEvent?: (event: ChangeEvent<R, M, G>) => void;
  }

  type CellWithChildrenProps<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
  > = Omit<CellProps<R, M, G, S>, "value"> & {
    readonly children: import("react").ReactNode;
  };

  type ValueCellProps<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
  > = CellProps<R, M, G, S, string | number | null> & {
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
    readonly columns: Table.Column<R, M, G>[];
  };

  type ReducerConfig<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>,
    A extends Redux.TableActionMap<M, G> = Redux.TableActionMap<M, G>
  > = TaskConfig<R, M, G, A> &
    Omit<CreateTableDataConfig<R, M, G>, "models" | "groups" | "columns"> & {
      readonly initialState: S;
      readonly tableId: Table.Id;
    };

  type SagaConfig<
    R extends RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
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

  type CellCallbackParams<
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = {
    readonly location: PdfTable.CellLocation;
    readonly column: PdfTable.Column<R, M, G>;
    readonly row: Table.Row<R, M>;
    readonly isHeader: boolean;
    readonly rawValue: any;
    readonly value: any;
    readonly indented: boolean;
  };

  type CellCallback<
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    V = any
  > = (params: PdfTable.CellCallbackParams<R, M, G>) => V;

  type OptionalCellCallback<
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    V = any
  > = V | CellCallback<R, M, G, V> | undefined;

  interface _CellClassName<
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > {
    [n: number]: OptionalCellCallback<R, M, G, string> | _CellClassName<R, M, G>;
  }
  type CellClassName<
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = OptionalCellCallback<R, M, G, string> | _CellClassName<R, M, G>;

  interface _CellStyle<
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > {
    [n: number]: OptionalCellCallback<R, M, G, import("@react-pdf/types").Style> | _CellStyle<R, M, G>;
  }
  type CellStyle<R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group> =
    | OptionalCellCallback<R, M, G, import("@react-pdf/types").Style>
    | _CellStyle<R, M, G>;

  type CellStandardProps<
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group
  > = {
    readonly style?: CellStyle<R, M, G>;
    readonly className?: CellClassName<R, M, G>;
    readonly textStyle?: CellStyle<R, M, G>;
    readonly textClassName?: CellClassName<R, M, G>;
  };

  interface FooterColumn {
    readonly value?: any;
    readonly textStyle?: import("@react-pdf/types").Style;
  }

  type Formatter = (value: string | number) => string;

  interface Column<R extends Table.RowData, M extends Model.Model = Model.Model, G extends Model.Group = Model.Group>
    extends Omit<Table.BaseColumn<R, M, G>, "domain"> {
    readonly domain: "pdf";
    // In the PDF case, since we cannot dynamically resize columns, the width refers to a ratio
    // of the column width to the overall table width assuming that all columns are present.  When
    // columns are hidden/shown, this ratio is adjusted.
    readonly width: number;
    readonly cellProps?: CellStandardProps<R, M, G>;
    readonly headerCellProps?: CellStandardProps<R, M, G>;
    readonly footer?: FooterColumn;
    readonly cellContentsVisible?: OptionalCellCallback<R, M, G, boolean>;
    readonly formatter?: PdfTable.Formatter;
    readonly cellRenderer?: (params: PdfTable.CellCallbackParams<R, M, G>) => JSX.Element;
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

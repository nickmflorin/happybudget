import { TooltipPropsWithTitle } from "antd/lib/tooltip";
import { ColDef, CellClassParams, RowNode, GridOptions, ColumnApi, GridApi } from "@ag-grid-community/core";
import RowManager from "lib/tabling/managers";

export interface GetExportValueParams {
  readonly node: RowNode;
  readonly colDef: ColDef;
  readonly value: string | undefined;
}

export type ExportValueGetters = { [key: string]: (params: GetExportValueParams) => string };

export interface BudgetTableMenuAction {
  readonly icon: JSX.Element;
  readonly tooltip?: Partial<TooltipPropsWithTitle> | string;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
}

export interface BudgetTableActionsParams<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  readonly onDelete: () => void;
  readonly selectedRows: R[];
}

export interface GroupProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  readonly onGroupRows: (rows: R[]) => void;
  readonly onDeleteGroup: (group: G) => void;
  readonly onEditGroup: (group: G) => void;
  readonly onRowRemoveFromGroup: (row: R) => void;
  readonly onRowAddToGroup: (groupId: number, row: R) => void;
}

export interface CookiesProps {
  readonly ordering?: string;
}

export interface CustomColDef<R extends Table.Row<G>, G extends Model.Group = Model.Group>
  extends Omit<ColDef, "field"> {
  readonly onClearValue?: any;
  // If true, a Backspace/Delete will cause the cell to clear before going into edit mode.  This
  // is particularly useful for Dropdowns rendered via a custom Cell Editor (Popup) where we need
  // to trigger a cell clear without showing the dropdown.
  readonly clearBeforeEdit?: boolean;
  readonly field: keyof R & string;
  readonly isCalculated?: boolean;
  readonly budgetTotal?: number;
  readonly tableTotal?: number;
  // isBase?: boolean;
}

export interface BudgetTableMenuProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  readonly columns: CustomColDef<R, G>[];
  readonly actions?: ((params: BudgetTableActionsParams<R, G>) => BudgetTableMenuAction[]) | BudgetTableMenuAction[];
  readonly saving?: boolean;
  readonly selected?: boolean;
  readonly search?: string;
  readonly canExport?: boolean;
  readonly canToggleColumns?: boolean;
  readonly canSearch?: boolean;
  readonly selectedRows: R[];
  readonly detached?: boolean;
  readonly onSearch?: (value: string) => void;
  readonly onSelectAll: (checked: boolean) => void;
  readonly onColumnsChange: (fields: Field[]) => void;
  readonly onExport: (fields: Field[]) => void;
  readonly onDelete: () => void;
}

export interface BudgetFooterGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  readonly options: GridOptions;
  // TODO: Refactor so we only have to provide one of these.
  readonly columns: CustomColDef<R, G>[];
  readonly colDefs: CustomColDef<R, G>[];
  readonly frameworkComponents?: { [key: string]: any };
  readonly identifierField: string;
  readonly identifierValue?: string | null;
  readonly loadingBudget?: boolean | undefined;
  readonly sizeColumnsToFit?: boolean | undefined;
  readonly setColumnApi: (api: ColumnApi) => void;
}

export interface TableFooterGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  readonly options: GridOptions;
  // TODO: Refactor so we only have to provide one of these.
  readonly columns: CustomColDef<R, G>[];
  readonly colDefs: CustomColDef<R, G>[];
  readonly frameworkComponents?: { [key: string]: any };
  readonly identifierField: string;
  readonly identifierValue?: string | null;
  readonly sizeColumnsToFit?: boolean | undefined;
  readonly setColumnApi: (api: ColumnApi) => void;
}

interface PrimaryGridPassThroughProps<
  R extends Table.Row<G>,
  M extends Model.Model,
  G extends Model.Group = Model.Group,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
> {
  readonly manager: RowManager<R, M, G, P>;
  readonly groups?: G[];
  readonly groupParams?: GroupProps<R, G>;
  readonly frameworkComponents?: { [key: string]: any };
  readonly sizeColumnsToFit?: boolean | undefined;
  readonly search: string;
  readonly processCellForClipboard?: { [key in keyof R]?: (row: R) => any };
  readonly rowRefreshRequired?: (existing: R, row: R) => boolean;
  readonly onRowUpdate: (payload: Table.RowChange<R>) => void;
  readonly onRowBulkUpdate?: (payload: Table.RowChange<R>[]) => void;
  readonly onRowAdd: () => void;
  readonly onRowDelete: (row: R) => void;
}

export interface PrimaryGridProps<
  R extends Table.Row<G>,
  M extends Model.Model,
  G extends Model.Group = Model.Group,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
> extends PrimaryGridPassThroughProps<R, M, G, P> {
  readonly api: GridApi | undefined;
  readonly columnApi: ColumnApi | undefined;
  readonly table: R[];
  readonly options: GridOptions;
  readonly colDefs: CustomColDef<R, G>[];
  readonly setAllSelected: (value: boolean) => void;
  readonly isCellEditable: (row: R, colDef: ColDef | CustomColDef<R, G>) => boolean;
  readonly setApi: (api: GridApi) => void;
  readonly setColumnApi: (api: ColumnApi) => void;
}

export interface BudgetTableProps<
  R extends Table.Row<G>,
  M extends Model.Model,
  G extends Model.Group = Model.Group,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
> extends Omit<GridOptions, "processCellForClipboard">,
    Omit<
      BudgetTableMenuProps<R, G>,
      "columns" | "onColumnsChange" | "onExport" | "onDelete" | "selected" | "selectedRows"
    >,
    StandardComponentProps {
  readonly columns: CustomColDef<R, G>[];
  readonly data: M[];
  readonly placeholders?: R[];
  readonly selected?: number[];
  readonly identifierField: string;
  readonly identifierFieldHeader: string;
  readonly identifierColumn?: Partial<CustomColDef<R, G>>;
  readonly actionColumn?: Partial<CustomColDef<R, G>>;
  readonly indexColumn?: Partial<CustomColDef<R, G>>;
  readonly expandColumn?: Partial<CustomColDef<R, G>>;
  readonly tableFooterIdentifierValue?: string | null;
  readonly budgetFooterIdentifierValue?: string | null;
  readonly saving: boolean;
  readonly loadingBudget?: boolean;
  readonly getExportValue?: ExportValueGetters;
  readonly exportable?: boolean;
  readonly exportFileName?: string;
  readonly nonEditableCells?: (keyof R)[];
  readonly cookies?: CookiesProps;
  readonly loading?: boolean;
  readonly renderFlag?: boolean;
  readonly cellClass?: (params: CellClassParams) => string | undefined;
  readonly onRowSelect: (id: number) => void;
  readonly onRowDeselect: (id: number) => void;
  readonly onRowExpand?: null | ((id: number) => void);
  readonly onBack?: () => void;
  readonly isCellEditable?: (row: R, col: ColDef) => boolean;
  readonly isCellSelectable?: (row: R, col: ColDef) => boolean;
  // Props Passed to the Primary Grid
  readonly manager: RowManager<R, M, G, P>;
  readonly groups?: G[];
  readonly groupParams?: GroupProps<R, G>;
  readonly frameworkComponents?: { [key: string]: any };
  readonly sizeColumnsToFit?: boolean | undefined;
  readonly search: string;
  readonly processCellForClipboard?: { [key in keyof R]?: (row: R) => any };
  readonly rowRefreshRequired?: (existing: R, row: R) => boolean;
  readonly onRowUpdate: (payload: Table.RowChange<R>) => void;
  readonly onRowBulkUpdate?: (payload: Table.RowChange<R>[]) => void;
  readonly onRowAdd: () => void;
  readonly onRowDelete: (row: R) => void;
}

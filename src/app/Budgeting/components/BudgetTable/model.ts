import { SyntheticEvent } from "react";
import { TooltipPropsWithTitle } from "antd/lib/tooltip";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import {
  ColDef,
  CellClassParams,
  GridOptions,
  ColumnApi,
  GridApi,
  Column,
  RowNode,
  ICellEditorParams
} from "@ag-grid-community/core";

// TODO: Start consolidating with the RowChange related types in the global type set.
export interface CellValueChangedParams<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  readonly column: Column;
  readonly row: R;
  readonly oldRow: R | null;
  readonly node: RowNode;
  readonly oldValue: any;
  readonly newValue: any;
  readonly change: Table.RowChange<R>;
}

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

export type CellDoneEditingEvent = SyntheticEvent | KeyboardEvent | CheckboxChangeEvent;

export const isKeyboardEvent = (e: CellDoneEditingEvent): e is KeyboardEvent => {
  return (e as KeyboardEvent).type === "keydown" && (e as KeyboardEvent).code !== undefined;
};

export interface CellEditorParams extends ICellEditorParams {
  // When the cell editor finishes editing, the AG Grid callback (onCellDoneEditing)
  // does not have any context about what event triggered the completion, so we have
  // to handle that ourselves so we can trigger different behaviors depending on
  // how the selection was performed.
  readonly onDoneEditing: (e: CellDoneEditingEvent) => void;
}

export interface CustomColDef<R extends Table.Row<G>, G extends Model.Group = Model.Group>
  extends Omit<ColDef, "field"> {
  readonly nullValue?: null | "" | 0 | [];
  // If true, a Backspace/Delete will cause the cell to clear before going into edit mode.  This
  // is particularly useful for Dropdowns rendered via a custom Cell Editor (Popup) where we need
  // to trigger a cell clear without showing the dropdown.
  readonly clearBeforeEdit?: boolean;
  readonly field: keyof R & string;
  readonly isCalculated?: boolean;
  readonly budgetTotal?: number;
  readonly tableTotal?: number;
  readonly excludeFromExport?: boolean;
  // isBase?: boolean;
  // When exporting, the default will be to use the processCellForClipboard unless
  // processCellForExport is also provided.
  readonly processCellForExport?: (row: R) => string;
  readonly processCellForClipboard?: (row: R) => string;
  readonly processCellFromClipboard?: (value: string) => any;
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
  // TODO: Stop using Field type.
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

// Props provided to the BudgetTable that are passed directly through to the PrimaryGrid.
interface PrimaryGridPassThroughProps<R extends Table.Row<G>, G extends Model.Group = Model.Group> {
  readonly groups?: G[];
  readonly groupParams?: GroupProps<R, G>;
  readonly frameworkComponents?: { [key: string]: any };
  readonly sizeColumnsToFit?: boolean | undefined;
  readonly search?: string;
  readonly identifierField: string;
  readonly onRowUpdate: (payload: Table.RowChange<R>) => void;
  readonly onRowBulkUpdate?: (payload: Table.RowChange<R>[]) => void;
  readonly onRowAdd: () => void;
  readonly onRowDelete: (row: R) => void;
  // Callback to conditionally set the ability of a row to expand or not.  Only applicable if
  // onRowExpand is provided to the BudgetTable.
  readonly rowCanExpand?: (row: R) => boolean;
  readonly onRowExpand?: null | ((id: number) => void);
  readonly onBack?: () => void;
}

export interface PrimaryGridProps<R extends Table.Row<G>, G extends Model.Group = Model.Group>
  extends PrimaryGridPassThroughProps<R, G> {
  readonly api: GridApi | undefined;
  readonly columnApi: ColumnApi | undefined;
  readonly table: R[];
  readonly options: GridOptions;
  readonly colDefs: CustomColDef<R, G>[];
  readonly onCellValueChanged: (params: CellValueChangedParams<R, G>) => void;
  readonly setAllSelected: (value: boolean) => void;
  readonly isCellEditable: (row: R, colDef: ColDef | CustomColDef<R, G>) => boolean;
  readonly setApi: (api: GridApi) => void;
  readonly setColumnApi: (api: ColumnApi) => void;
  readonly processCellForClipboard: (column: Column, row: R, value: any) => string;
  readonly processCellFromClipboard: (column: Column, row: R, value: any) => any;
}

export interface BudgetTableProps<
  R extends Table.Row<G>,
  M extends Model.Model,
  G extends Model.Group = Model.Group,
  P extends Http.ModelPayload<M> = Http.ModelPayload<M>
> extends Omit<GridOptions, "frameworkComponents">,
    Omit<
      BudgetTableMenuProps<R, G>,
      "columns" | "onColumnsChange" | "onExport" | "onDelete" | "selected" | "selectedRows"
    >,
    PrimaryGridPassThroughProps<R, G>,
    StandardComponentProps {
  readonly columns: CustomColDef<R, G>[];
  readonly data: M[];
  readonly placeholders?: R[];
  readonly selected?: number[];
  readonly identifierFieldHeader: string;
  readonly identifierColumn?: Partial<CustomColDef<R, G>>;
  readonly actionColumn?: Partial<CustomColDef<R, G>>;
  readonly indexColumn?: Partial<CustomColDef<R, G>>;
  readonly expandColumn?: Partial<CustomColDef<R, G>>;
  readonly tableFooterIdentifierValue?: string | null;
  readonly budgetFooterIdentifierValue?: string | null;
  readonly saving: boolean;
  readonly loadingBudget?: boolean;
  readonly exportable?: boolean;
  readonly exportFileName?: string;
  readonly nonEditableCells?: (keyof R)[];
  readonly cookies?: CookiesProps;
  readonly loading?: boolean;
  readonly renderFlag?: boolean;
  readonly manager: Table.IRowManager<R, M, P, G>;
  readonly cellClass?: (params: CellClassParams) => string | undefined;
  readonly onRowSelect: (id: number) => void;
  readonly onRowDeselect: (id: number) => void;
  readonly isCellEditable?: (row: R, col: ColDef) => boolean;
  readonly isCellSelectable?: (row: R, col: ColDef) => boolean;
}

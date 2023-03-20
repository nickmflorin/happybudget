import { enumeratedLiterals, EnumeratedLiteralType } from "../../util";

import * as columns from "./columns";
import * as events from "./events";
import * as framework from "./framework";
import * as rows from "./rows";

export const TableNames = enumeratedLiterals([
  "account-subaccounts",
  "accounts",
  "subaccount-subaccounts",
  "fringes",
  "actuals",
  "contacts",
] as const);

export type TableName = EnumeratedLiteralType<typeof TableNames>;

export type TableContext = Record<string, unknown>;

export type DataGridInstance = {
  readonly getCSVData: (fields?: string[]) => CSVData;
};

export type LocallyTrackedChangesCb<R extends rows.Row = rows.Row> = (
  events: events.ChangeEvent<events.ChangeEventId, R>[],
) => void;

export type TableInstanceAttachmentAction = () => void;

export type TableInstance<
  R extends rows.Row,
  M extends Model.RowHttpModel = Model.RowHttpModel,
> = DataGridInstance &
  UINotificationsManager & {
    readonly saving: (v: boolean) => void;
    readonly getColumns: () => columns.ModelColumn<R, M>[];
    readonly getFocusedRow: () => rows.Row<R, rows.BodyRowType> | null;
    readonly getRow: (id: rows.RowId<"body">) => rows.Row<R, rows.BodyRowType> | null;
    readonly getRows: () => rows.Row<R, rows.BodyRowType>[];
    readonly getRowsAboveAndIncludingFocusedRow: () => rows.Row<R, rows.BodyRowType>[];
    readonly dispatchEvent: (event: SingleOrArray<events.TableEvent>) => void;
    readonly changeColumnVisibility: (
      changes: SingleOrArray<columns.ColumnVisibilityChange>,
      sizeToFit?: boolean,
    ) => void;
  };

/*
We have to allow the onClick prop and ID prop to pass through the entire component to the render
method in the case that we are rendering a button and we also specify wrapInDropdown.  This is so
that AntD can control the dropdown visibility via the button.and click aways can be properly
detected with the button ID.
*/
export type MenuActionRenderProps = {
  readonly id?: string;
  readonly onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export type MenuActionRenderFunc = (props: MenuActionRenderProps) => JSX.Element;

export type MenuActionObj = {
  readonly index?: number;
  readonly icon?: IconOrElement;
  readonly tooltip?: DeterministicTooltip;
  readonly disabled?: boolean;
  readonly hidden?: boolean;
  readonly label?: string;
  readonly isWriteOnly?: boolean;
  readonly location?: "right" | "left";
  readonly active?: boolean;
  // If being wrapped in a Dropdown, the onClick prop will not be used.
  readonly onClick?: () => void;
  readonly wrapInDropdown?: (children: JSX.Element | JSX.Element[]) => JSX.Element;
  /* We have to allow the onClick prop and ID prop to pass through the entire component to the
     render method in the case that we are rendering a button and we also specify wrapInDropdown.
     This is so that AntD can control the dropdown visibility via the button.and click aways can be
     properly detected with the button ID. */
  readonly render?: MenuActionRenderFunc;
};

export type PublicMenuActionParams<
  R extends rows.Row = rows.Row,
  M extends Model.RowHttpModel = Model.RowHttpModel,
> = {
  readonly apis: framework.GridApis<R> | null;
  readonly columns: columns.DataColumn<R, M>[];
  readonly hiddenColumns?: columns.HiddenColumns;
};

export type AuthenticatedMenuActionParams<
  R extends rows.Row = rows.Row,
  M extends Model.RowHttpModel = Model.RowHttpModel,
> = PublicMenuActionParams<R, M> & {
  readonly selectedRows: rows.Row<R, rows.EditableRowType>[];
};

export type MenuActionCallback<
  V,
  R extends rows.Row = rows.Row,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  T extends PublicMenuActionParams<R, M> = PublicMenuActionParams<R, M>,
> = (params: T) => V;

export type MenuAction<
  R extends rows.Row = rows.Row,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  T extends PublicMenuActionParams<R, M> = PublicMenuActionParams<R, M>,
> = MenuActionObj | MenuActionCallback<MenuActionObj, R, M, T>;

export type MenuActions<
  R extends rows.Row = rows.Row,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  T extends PublicMenuActionParams<R, M> = PublicMenuActionParams<R, M>,
> = Array<MenuAction<R, M, T>> | MenuActionCallback<MenuAction<R, M, T>[], R, M, T>;

export type PublicMenuAction<
  R extends rows.Row = rows.Row,
  M extends Model.RowHttpModel = Model.RowHttpModel,
> = MenuAction<R, M, PublicMenuActionParams<R, M>>;

export type AuthenticatedMenuAction<
  R extends rows.Row = rows.Row,
  M extends Model.RowHttpModel = Model.RowHttpModel,
> = MenuAction<R, M, AuthenticatedMenuActionParams<R, M>>;

export type PublicMenuActions<
  R extends rows.Row = rows.Row,
  M extends Model.RowHttpModel = Model.RowHttpModel,
> = MenuActions<R, M, PublicMenuActionParams<R, M>>;

export type AuthenticatedMenuActions<
  R extends rows.Row = rows.Row,
  M extends Model.RowHttpModel = Model.RowHttpModel,
> = MenuActions<R, M, AuthenticatedMenuActionParams<R, M>>;

export type FooterGridConfig<
  R extends rows.Row = rows.Row,
  M extends Model.RowHttpModel = Model.RowHttpModel,
> = {
  readonly id: "page" | "footer";
  readonly rowClass: rows.RowClassName<rows.Row<R, rows.BodyRowType>>;
  readonly className: string;
  readonly rowHeight?: number;
  readonly getFooterColumn: (column: columns.DataColumn<R, M>) => columns.FooterColumn<R, M> | null;
};

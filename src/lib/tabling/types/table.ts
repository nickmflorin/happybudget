import * as fs from "../../fs";
import * as model from "../../model";
import * as ui from "../../ui";
import { enumeratedLiterals, EnumeratedLiteralType, SingleOrArray } from "../../util";
import * as columns from "../columns";
import * as events from "../events";
import * as rows from "../rows";

import * as framework from "./framework";

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
  readonly getCSVData: (fields?: string[]) => fs.CSVData;
};

export type LocallyTrackedChangesCb<R extends rows.Row = rows.Row> = (
  events: events.ChangeEvent<events.ChangeEventId, R>[],
) => void;

export type TableInstanceAttachmentAction = () => void;

export type TableInstance<
  R extends rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = DataGridInstance & {
  // UINotificationsManager & {
  readonly saving: (v: boolean) => void;
  readonly getColumns: () => columns.ModelColumn<R, M>[];
  readonly getFocusedRow: () => rows.RowSubType<R, rows.BodyRowType> | null;
  readonly getRow: (
    id: rows.RowId<rows.BodyRowType>,
  ) => rows.RowSubType<R, rows.BodyRowType> | null;
  readonly getRows: () => rows.RowSubType<R, rows.BodyRowType>[];
  readonly getRowsAboveAndIncludingFocusedRow: () => rows.RowSubType<R, rows.BodyRowType>[];
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
  readonly icon?: ui.IconProp;
  readonly tooltip?: ui.DeterministicTooltip;
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
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = {
  readonly apis: framework.GridApis<R> | null;
  readonly columns: columns.DataColumn<R, M>[];
  readonly hiddenColumns?: columns.HiddenColumns;
};

export type AuthenticatedMenuActionParams<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = PublicMenuActionParams<R, M> & {
  readonly selectedRows: rows.RowSubType<R, rows.EditableRowType>[];
};

export type MenuActionCallback<
  V,
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  T extends PublicMenuActionParams<R, M> = PublicMenuActionParams<R, M>,
> = (params: T) => V;

export type MenuAction<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  T extends PublicMenuActionParams<R, M> = PublicMenuActionParams<R, M>,
> = MenuActionObj | MenuActionCallback<MenuActionObj, R, M, T>;

export type MenuActions<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  T extends PublicMenuActionParams<R, M> = PublicMenuActionParams<R, M>,
> = Array<MenuAction<R, M, T>> | MenuActionCallback<MenuAction<R, M, T>[], R, M, T>;

export type PublicMenuAction<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = MenuAction<R, M, PublicMenuActionParams<R, M>>;

export type AuthenticatedMenuAction<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = MenuAction<R, M, AuthenticatedMenuActionParams<R, M>>;

export type PublicMenuActions<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = MenuActions<R, M, PublicMenuActionParams<R, M>>;

export type AuthenticatedMenuActions<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = MenuActions<R, M, AuthenticatedMenuActionParams<R, M>>;

export type FooterGridConfig<
  R extends rows.Row = rows.Row,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
> = {
  readonly id: "page" | "footer";
  readonly rowClass: rows.RowClassName<rows.RowSubType<R, rows.BodyRowType>>;
  readonly className: string;
  readonly rowHeight?: number;
  readonly getFooterColumn: (column: columns.DataColumn<R, M>) => columns.FooterColumn<R, M> | null;
};

/* Either the TopSheet page or an ID of the account.
   export type PdfBudgetTableOption = "topsheet" | number; */

/* export type PdfBudgetTableHeaderOptions = {
     readonly header: ui.HTMLPdfNode[];
     readonly left_image: fs.UploadedImage | fs.SavedImage | null;
     readonly left_info: ui.HTMLPdfNode[] | null;
     readonly right_image: fs.UploadedImage | fs.SavedImage | null;
     readonly right_info: ui.HTMLPdfNode[] | null;
   }; */

/* export type PdfBudgetTableOptions = {
     readonly date: string;
     readonly header: PdfBudgetTableHeaderOptions;
     readonly columns: string[];
     readonly tables?: PdfBudgetTableOption[] | null | undefined;
     readonly excludeZeroTotals: boolean;
     readonly notes?: ui.HTMLPdfNode[];
     readonly includeNotes: boolean;
   }; */

/* export type PdfActualsTableOptions = {
     readonly date: string;
     readonly header: ui.HTMLPdfNode[];
     readonly columns: string[];
     readonly excludeZeroTotals: boolean;
   }; */

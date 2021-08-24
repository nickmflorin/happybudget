import { isNil, filter, map, includes } from "lodash";
import classNames from "classnames";
import { SuppressKeyboardEventParams, Column } from "@ag-grid-community/core";

import { tabling, model } from "lib";
import BudgetTable, { BudgetTableProps } from "components/tabling/tables/BudgetTable";
import { framework } from "components/tabling/generic";

import Framework from "./framework";

type R = Tables.SubAccountRow;
type M = Model.SubAccount;

type OmitTableProps = "levelType" | "cookieNames" | "getRowChildren" | "getRowLabel" | "showPageFooter";

export type GenericSubAccountsTableProps = Omit<BudgetTableProps<R, M>, OmitTableProps> & {
  readonly cookieNames?: Omit<Table.CookieNames, "hiddenColumns">;
  readonly exportFileName: string;
  readonly categoryName: "Sub Account" | "Detail";
  readonly identifierFieldHeader: "Account" | "Line";
  readonly fringes: Model.Fringe[];
  readonly fringesEditor: "FringesEditor" | "FringesEditor" | "FringesEditor" | "FringesEditor";
  readonly fringesEditorParams: {
    colId: keyof R;
    onAddFringes: () => void;
  };
  readonly tableFooterIdentifierValue: string;
  readonly budgetFooterIdentifierValue?: string;
  readonly subAccountUnits: Model.Tag[];
  readonly levelType: "account" | "subaccount";
  readonly onEditFringes: () => void;
  readonly onEditGroup?: (group: Model.Group) => void;
};

const GenericSubAccountsTable = ({
  /* eslint-disable indent */
  categoryName,
  identifierFieldHeader,
  fringes,
  fringesEditor,
  fringesEditorParams,
  subAccountUnits,
  exportFileName,
  budgetFooterIdentifierValue = "Budget Total",
  tableFooterIdentifierValue,
  onEditFringes,
  onEditGroup,
  ...props
}: GenericSubAccountsTableProps): JSX.Element => {
  const table = tabling.hooks.useBudgetTableIfNotDefined<R, M>(props.table);

  return (
    <BudgetTable<R, M>
      {...props}
      table={table}
      showPageFooter={true}
      className={classNames("subaccounts-table", props.className)}
      getRowChildren={(m: M) => m.subaccounts}
      getRowLabel={(m: M) => m.identifier || m.description}
      getRowName={"Sub Account"}
      framework={tabling.util.combineFrameworks(Framework, props.framework)}
      cookieNames={{ ...props.cookieNames, hiddenColumns: "subaccount-table-hidden-columns" }}
      actions={(params: Table.MenuActionParams<R, M>) => [
        {
          icon: "trash-alt",
          disabled: params.selectedRows.length === 0,
          onClick: () => {
            const rows: R[] = params.apis.grid.getSelectedRows();
            props.onChangeEvent?.({
              payload: { rows, columns: params.columns },
              type: "rowDelete"
            });
          }
        },
        {
          icon: "sigma",
          disabled: true,
          text: "Group"
        },
        {
          icon: "percentage",
          disabled: true,
          text: "Mark Up"
        },
        framework.actions.ToggleColumnAction(table.current, params),
        framework.actions.ExportCSVAction(table.current, params, exportFileName),
        ...(!isNil(props.actions) ? (Array.isArray(props.actions) ? props.actions : props.actions(params)) : [])
      ]}
      columns={[
        {
          field: "identifier",
          columnType: "number",
          headerName: identifierFieldHeader,
          footer: {
            value: tableFooterIdentifierValue,
            colSpan: (params: Table.ColSpanParams<R, M>) => 2
          },
          page: {
            value: budgetFooterIdentifierValue,
            colSpan: (params: Table.ColSpanParams<R, M>) => 2
          },
          index: 0,
          cellRenderer: "IdentifierCell",
          width: 100,
          maxWidth: 100,
          suppressSizeToFit: true,
          cellRendererParams: {
            onGroupEdit: onEditGroup
          },
          cellStyle: { textAlign: "left" },
          colSpan: (params: Table.ColSpanParams<R, M>) => {
            const row: R = params.data;
            if (row.meta.isGroupRow === true) {
              /*
              Note: We have to look at all of the visible columns that are present up until
              the calculated columns.  This means we have to use the AG Grid ColumnApi (not our
              own columns).
              */
              const agColumns: Column[] | undefined = params.columnApi?.getAllDisplayedColumns();
              if (!isNil(agColumns)) {
                const readColumns: Table.Field<R, M>[] = map(
                  filter(params.columns, (c: Table.Column<R, M>) => {
                    const fieldBehavior: Table.FieldBehavior[] = c.fieldBehavior || ["read", "write"];
                    return includes(fieldBehavior, "read") && c.isCalculated !== true;
                  }),
                  (c: Table.Column<R, M>) => c.field
                );
                const readableAgColumns = filter(agColumns, (c: Column) => includes(readColumns, c.getColId()));
                return readableAgColumns.length;
              }
            }
            return 1;
          }
        },
        {
          field: "description",
          headerName: `${categoryName} Description`,
          flex: 1,
          columnType: "longText",
          index: 1,
          colSpan: (params: Table.ColSpanParams<R, M>) => {
            const row: R = params.data;
            if (!isNil(row.meta) && !isNil(row.meta.children)) {
              return !isNil(row.meta.children) && row.meta.children.length !== 0 ? 7 : 1;
            }
            return 1;
          }
        },
        {
          field: "quantity",
          headerName: "Qty",
          width: 60,
          isCalculating: true,
          valueSetter: tabling.valueSetters.integerValueSetter<R>("quantity"),
          columnType: "number",
          // If the plurality of the quantity changes, we need to refresh the refresh
          // the unit column to change the plurality of the tag in the cell.
          refreshColumns: (change: Table.CellChange<R, M>) => {
            // This shouldn't trigger the callback, but just to be sure.
            if (change.newValue === null && change.oldValue === null) {
              return [];
            } else if (
              change.newValue === null ||
              change.oldValue === null ||
              (change.newValue > 1 && !(change.oldValue > 1)) ||
              (change.newValue <= 1 && !(change.oldValue <= 1))
            ) {
              return ["unit"];
            } else {
              return [];
            }
          }
        },
        framework.columnObjs.TagSelectColumn<R, M>({
          field: "unit",
          headerName: "Unit",
          cellRenderer: { data: "SubAccountUnitCell" },
          cellEditor: "SubAccountUnitEditor",
          models: subAccountUnits
        }),
        {
          field: "multiplier",
          headerName: "X",
          width: 50,
          isCalculating: true,
          valueSetter: tabling.valueSetters.floatValueSetter<R>("multiplier"),
          columnType: "number"
        },
        {
          field: "rate",
          headerName: "Rate",
          width: 100,
          isCalculating: true,
          valueFormatter: tabling.formatters.agCurrencyValueFormatter,
          valueSetter: tabling.valueSetters.floatValueSetter<R>("rate"),
          columnType: "currency"
        },
        {
          field: "fringes",
          headerName: "Fringes",
          isCalculating: true,
          cellClass: classNames("cell--renders-html"),
          cellRenderer: { data: "FringesCell" },
          headerComponentParams: {
            onEdit: () => onEditFringes()
          },
          width: 200,
          nullValue: [],
          cellEditor: fringesEditor,
          cellEditorParams: fringesEditorParams,
          columnType: "singleSelect",
          getRowValue: (m: M): Model.Fringe[] => model.util.getModelsByIds(fringes, m.fringes),
          getModelValue: (row: R): number[] => map(row.fringes, (f: Model.Fringe) => f.id),
          processCellFromClipboard: (value: string) => {
            // NOTE: When pasting from the clipboard, the values will be a comma-separated
            // list of Fringe Names (assuming a rational user).  Currently, Fringe Names are
            // enforced to be unique, so we can map the Name back to the ID.  However, this might
            // not always be the case, in which case this logic breaks down.
            const names = value.split(",");
            const fs: Model.Fringe[] = filter(
              map(names, (name: string) => model.util.inferModelFromName<Model.Fringe>(fringes, name)),
              (f: Model.Fringe | null) => f !== null
            ) as Model.Fringe[];
            return map(fs, (f: Model.Fringe) => f.id);
          },
          processCellForClipboard: (row: R) => {
            return map(row.fringes, (fringe: Model.Fringe) => fringe.name).join(", ");
          },
          // Required to allow the dropdown to be selectable on Enter key.
          suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
            if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
              return true;
            }
            return false;
          }
        },
        ...props.columns
      ]}
    />
  );
};

export default GenericSubAccountsTable;

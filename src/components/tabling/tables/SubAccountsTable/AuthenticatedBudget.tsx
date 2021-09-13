import { isNil, find, map, filter } from "lodash";

import { model, tabling } from "lib";
import { framework } from "components/tabling/generic";

import {
  AuthenticatedBudgetTable,
  AuthenticatedBudgetTableProps,
  framework as budgetTableFramework
} from "../BudgetTable";
import SubAccountsTable, { WithSubAccountsTableProps } from "./SubAccountsTable";

type R = Tables.SubAccountRowData;
type M = Model.SubAccount;
type G = Model.BudgetGroup;

type PreContactCreate = Omit<Table.SoloCellChange<R>, "newValue">;

export type AuthenticatedBudgetProps = Omit<AuthenticatedBudgetTableProps<R, M>, "columns"> & {
  readonly subAccountUnits: Model.Tag[];
  readonly fringes: Tables.FringeRow[];
  readonly categoryName: "Sub Account" | "Detail";
  readonly identifierFieldHeader: "Account" | "Line";
  readonly cookieNames: Table.CookieNames;
  readonly contacts: Model.Contact[];
  readonly exportFileName: string;
  readonly onExportPdf: () => void;
  readonly onNewContact: (params: { name?: string; change: PreContactCreate }) => void;
  readonly onEditContact: (id: ID) => void;
  readonly onEditGroup: (group: Table.GroupRow<R>) => void;
  readonly onAddFringes: () => void;
  readonly onEditFringes: () => void;
};

const AuthenticatedBudgetSubAccountsTable = (
  props: WithSubAccountsTableProps<AuthenticatedBudgetProps>
): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined(props.table);

  return (
    <AuthenticatedBudgetTable<R, M>
      {...props}
      table={table}
      pinFirstColumn={true}
      columns={tabling.columns.mergeColumns<Table.Column<R, M, G>, R, M, G>(props.columns, {
        identifier: (col: Table.Column<R, M, G>) =>
          budgetTableFramework.columnObjs.IdentifierColumn<R, M>({
            ...col,
            cellRendererParams: {
              ...col.cellRendererParams,
              onGroupEdit: props.onEditGroup
            },
            headerName: props.identifierFieldHeader
          }),
        description: { headerName: `${props.categoryName} Description` },
        unit: (col: Table.Column<R, M, G>) =>
          framework.columnObjs.TagSelectColumn<R, M, G>({ ...col, models: props.subAccountUnits }),
        fringes: {
          cellEditor: "FringesEditor",
          cellEditorParams: { onAddFringes: props.onAddFringes },
          headerComponentParams: { onEdit: () => props.onEditFringes() },
          processCellFromClipboard: (value: string) => {
            // NOTE: When pasting from the clipboard, the values will be a comma-separated
            // list of Fringe Names (assuming a rational user).  Currently, Fringe Names are
            // enforced to be unique, so we can map the Name back to the ID.  However, this might
            // not always be the case, in which case this logic breaks down.
            const names = value.split(",");
            const fs: Tables.FringeRow[] = filter(
              map(names, (name: string) => model.util.inferModelFromName<Tables.FringeRow>(props.fringes, name)),
              (f: Tables.FringeRow | null) => f !== null
            ) as Tables.FringeRow[];
            return map(fs, (f: Tables.FringeRow) => f.id);
          },
          processCellForClipboard: (row: R) => {
            const fringes = model.util.getModelsByIds<Tables.FringeRow>(props.fringes, row.fringes);
            return map(fringes, (fringe: Tables.FringeRow) => fringe.name).join(", ");
          }
        },
        contact: (col: Table.Column<R, M, G>) =>
          framework.columnObjs.ModelSelectColumn<R, M, Model.Contact, G>({
            ...col,
            cellRendererParams: { onEditContact: props.onEditContact },
            cellEditorParams: { onNewContact: props.onNewContact },
            models: props.contacts,
            modelClipboardValue: (m: Model.Contact) => m.full_name,
            processCellFromClipboard: (name: string): Model.Contact | null => {
              if (name.trim() === "") {
                return null;
              } else {
                const names = model.util.parseFirstAndLastName(name);
                const contact: Model.Contact | undefined = find(props.contacts, {
                  first_name: names[0],
                  last_name: names[1]
                });
                return contact || null;
              }
            }
          })
      })}
      onCellFocusChanged={(params: Table.CellFocusChangedParams<R, M, G>) => {
        /*
        For the ContactCell, we want the contact tag in the cell to be clickable
        only when the cell is focused.  This means we have to rerender the cell when
        it becomes focused or unfocused so that the tag becomes clickable (in the focused
        case) or unclickable (in the unfocused case).
        */
        const rowNodes: Table.RowNode[] = [];
        if (params.cell.column.field === "contact") {
          rowNodes.push(params.cell.rowNode);
        }
        if (!isNil(params.previousCell) && params.previousCell.column.field === "contact") {
          rowNodes.push(params.previousCell.rowNode);
        }
        if (rowNodes.length !== 0) {
          params.apis.grid.refreshCells({
            force: true,
            rowNodes,
            columns: ["contact"]
          });
        }
      }}
      actions={(params: Table.AuthenticatedMenuActionParams<R, M, G>) => [
        {
          icon: "folder",
          disabled: true,
          label: "Group",
          isWriteOnly: true
        },
        {
          icon: "badge-percent",
          disabled: true,
          label: "Mark Up",
          isWriteOnly: true
        },
        ...(isNil(props.actions) ? [] : Array.isArray(props.actions) ? props.actions : props.actions(params)),
        framework.actions.ToggleColumnAction<R, M, G>(table.current, params),
        framework.actions.ExportPdfAction(props.onExportPdf),
        framework.actions.ExportCSVAction<R, M, G>(table.current, params, props.exportFileName)
      ]}
    />
  );
};

export default SubAccountsTable<AuthenticatedBudgetProps>(AuthenticatedBudgetSubAccountsTable);

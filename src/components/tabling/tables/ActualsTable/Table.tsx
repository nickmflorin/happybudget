import { map, filter, find } from "lodash";

import { model, tabling } from "lib";

import { framework, WithConnectedTableProps } from "components/tabling/generic";
import { AuthenticatedModelTable, AuthenticatedModelTableProps } from "../ModelTable";
import Framework from "./framework";
import Columns from "./Columns";

type R = Tables.ActualRowData;
type M = Model.Actual;

type PreContactCreate = Omit<Table.SoloCellChange<R>, "newValue">;

export type Props = Omit<AuthenticatedModelTableProps<R, M>, "columns"> & {
  readonly exportFileName: string;
  readonly contacts: Model.Contact[];
  readonly onSubAccountsTreeSearch: (value: string) => void;
  readonly onNewContact: (params: { name?: string; change: PreContactCreate }) => void;
  readonly onEditContact: (id: number) => void;
};

const ActualsTable = ({
  exportFileName,
  contacts,
  onSubAccountsTreeSearch,
  onNewContact,
  onEditContact,
  ...props
}: WithConnectedTableProps<Props, R, M>): JSX.Element => {
  const table = tabling.hooks.useTableIfNotDefined<R>(props.table);

  return (
    <AuthenticatedModelTable<R, M>
      {...props}
      table={table}
      showPageFooter={false}
      menuPortalId={"supplementary-header"}
      cookieNames={{ hiddenColumns: "actuals-table-hidden-columns" }}
      getModelRowName={(r: Table.ModelRow<R>) => r.data.description}
      getPlaceholderRowName={(r: Table.PlaceholderRow<R>) => r.data.description}
      getModelRowLabel={"Sub Account"}
      getPlaceholderRowLabel={"Sub Account"}
      framework={Framework}
      actions={(params: Table.AuthenticatedMenuActionParams<R, M>) => [
        framework.actions.ToggleColumnAction(table.current, params),
        framework.actions.ExportCSVAction(table.current, params, exportFileName)
      ]}
      columns={tabling.columns.mergeColumns<Table.Column<R, M>, R, M>(Columns, {
        subaccount: (col: Table.Column<R, M>) =>
          framework.columnObjs.SelectColumn<R, M>({
            ...col,
            processCellFromClipboard: (name: string) => {
              if (name.trim() === "") {
                return null;
              }
              const availableSubAccounts: Model.SimpleSubAccount[] = filter(
                map(
                  filter(props.data, (r: Table.Row<R>) => tabling.typeguards.isDataRow(r)),
                  (row: Table.Row<R>) => row.data.subaccount
                ),
                (sub: Model.SimpleSubAccount | null) => sub !== null && sub.identifier !== null
              ) as Model.SimpleSubAccount[];
              // NOTE: If there are multiple sub accounts with the same identifier, this will
              // return the first and issue a warning.
              const subaccount = model.util.inferModelFromName<Model.SimpleSubAccount>(availableSubAccounts, name, {
                nameField: "identifier"
              });
              return subaccount;
            },
            cellEditorParams: {
              ...col.cellEditorParams,
              setSearch: (value: string) => onSubAccountsTreeSearch(value)
            }
          }),
        contact: (col: Table.Column<R, M>) =>
          framework.columnObjs.ModelSelectColumn<R, M, Model.Contact>({
            ...col,
            cellRendererParams: { onEditContact },
            cellEditorParams: { onNewContact },
            models: contacts,
            modelClipboardValue: (m: Model.Contact) => m.full_name,
            processCellFromClipboard: (name: string): Model.Contact | null => {
              if (name.trim() === "") {
                return null;
              } else {
                const names = model.util.parseFirstAndLastName(name);
                const contact: Model.Contact | undefined = find(contacts, {
                  first_name: names[0],
                  last_name: names[1]
                });
                return contact || null;
              }
            }
          })
      })}
    />
  );
};

export default ActualsTable;

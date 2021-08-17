import { isNil, find } from "lodash";

import { model, tabling } from "lib";
import { framework } from "components/tabling/generic";

import { ReadOnlyBudgetTable, ReadOnlyBudgetTableProps } from "../BudgetTable";
import SubAccountsTable, { SubAccountsTableProps, WithSubAccountsTableProps } from "./SubAccountsTable";

type R = Tables.SubAccountRow;
type M = Model.SubAccount;

export type ReadOnlyBudgetSubAccountsTableProps = SubAccountsTableProps &
  Omit<ReadOnlyBudgetTableProps<R, M>, "cookieNames" | "budgetType" | "getRowChildren" | "columns"> & {
    readonly budget?: Model.Budget;
    readonly tableRef?: NonNullRef<Table.ReadOnlyTableRefObj<R, M>>;
    readonly cookieNames: Table.CookieNames;
    readonly detail: Model.Account | M | undefined;
    readonly contacts: Model.Contact[];
    readonly contactsColumn?: Partial<Table.Column<R, M>>;
    readonly exportFileName: string;
  };

const ReadOnlyBudgetSubAccountsTable = (
  props: WithSubAccountsTableProps<ReadOnlyBudgetSubAccountsTableProps>
): JSX.Element => {
  const tableRef = tabling.hooks.useReadOnlyTableIfNotDefined(props.tableRef);

  return (
    <ReadOnlyBudgetTable<R, M>
      {...props}
      tableRef={tableRef}
      columns={[
        framework.columnObjs.ModelSelectColumn<R, M, Model.Contact>({
          field: "contact",
          headerName: "Contact",
          cellRenderer: { data: "ContactCell" },
          cellEditor: "ContactEditor",
          columnType: "contact",
          index: 2,
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
          },
          ...props.contactsColumn
        }),
        ...props.columns,
        framework.columnObjs.CalculatedColumn({
          field: "estimated",
          headerName: "Estimated",
          page: {
            value: !isNil(props.budget) && !isNil(props.budget.estimated) ? props.budget.estimated : 0.0
          },
          footer: {
            value: !isNil(props.detail) && !isNil(props.detail.estimated) ? props.detail.estimated : 0.0
          }
        }),
        framework.columnObjs.CalculatedColumn({
          field: "actual",
          headerName: "Actual",
          page: {
            value: !isNil(props.budget) && !isNil(props.budget.actual) ? props.budget.actual : 0.0
          },
          footer: {
            value: !isNil(props.detail) && !isNil(props.detail.actual) ? props.detail.actual : 0.0
          }
        }),
        framework.columnObjs.CalculatedColumn({
          field: "variance",
          headerName: "Variance",
          page: {
            value: !isNil(props.budget) && !isNil(props.budget.variance) ? props.budget.variance : 0.0
          },
          footer: {
            value: !isNil(props.detail) && !isNil(props.detail.variance) ? props.detail.variance : 0.0
          }
        })
      ]}
      budgetType={"budget"}
      actions={(params: Table.ReadOnlyMenuActionParams<R, M>) => [
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
        framework.actions.ToggleColumnAction<R, M>(tableRef.current, params),
        framework.actions.ExportCSVAction(tableRef.current, params, props.exportFileName)
      ]}
    />
  );
};

export default SubAccountsTable<ReadOnlyBudgetSubAccountsTableProps>(ReadOnlyBudgetSubAccountsTable);

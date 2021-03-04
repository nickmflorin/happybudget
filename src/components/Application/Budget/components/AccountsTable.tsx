import { useCallback, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { forEach, map, find, isNil } from "lodash";
import { v4 as uuidv4 } from "uuid";

import { AgGridReact } from "ag-grid-react";
import { ColDef, CellEditingStoppedEvent } from "ag-grid-community";

import { createAccount, updateAccount } from "services";
import { handleRequestError } from "store/tasks";
import { replaceInArray } from "util/arrays";

import {
  addBudgetAccountToStateAction,
  updateBudgetAccountInStateAction,
  setBudgetAccountsSearchAction
} from "../actions";
import TableFooter from "./TableFooter";
import TableHeader from "./TableHeader";
import "./Table.scss";

interface IRow {
  id: number | string;
  exists?: boolean;
  account_number: string;
  description: string;
}

const colDefs: ColDef[] = [
  {
    field: "account_number",
    headerName: "Account",
    editable: true
  },
  {
    field: "description",
    headerName: "Category Description",
    editable: true
  },
  {
    field: "estimated",
    headerName: "Estimated"
  },
  {
    field: "actual",
    headerName: "Actual"
  },
  {
    field: "variance",
    headerName: "Variance"
  }
];

interface AccountsTableProps {
  budgetId: number;
}

const AccountsTable = ({ budgetId }: AccountsTableProps): JSX.Element => {
  const [gridApi, setGridApi] = useState<any | undefined>(undefined);
  const [rowData, setRowData] = useState<IRow[]>([]);
  const dispatch = useDispatch();
  const accounts = useSelector((state: Redux.IApplicationStore) => state.budget.accounts.list);

  const onGridReady = useCallback((params: any): void => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  }, []);

  useEffect(() => {
    if (accounts.responseWasReceived === true) {
      const tableData: IRow[] = [];
      if (accounts.data.length !== 0) {
        forEach(accounts.data, (account: IAccount) => {
          tableData.push({
            account_number: account.account_number,
            description: account.description,
            id: account.id
          });
        });
        setRowData(tableData);
      } else {
        setRowData([
          { account_number: "", description: "", id: uuidv4(), exists: false },
          { account_number: "", description: "", id: uuidv4(), exists: false }
        ]);
      }
    }
  }, [accounts.data, accounts.responseWasReceived]);

  // useEffect(() => {
  //   if (!isNil(gridApi)) {
  //     gridApi.setQuickFilter(search);
  //   }
  // }, [search, gridApi]);

  return (
    <div className={"ag-theme-alpine"} style={{ width: "100%", position: "relative" }}>
      <TableHeader
        search={accounts.search}
        setSearch={(value: string) => dispatch(setBudgetAccountsSearchAction(budgetId, value))}
        onDelete={() => console.log("Need to implement.")}
        onSum={() => console.log("Not yet supported.")}
        onPercentage={() => console.log("Not yet supported.")}
      />
      <AgGridReact
        columnDefs={map(colDefs, (col: ColDef) => ({
          ...col,
          suppressMenu: true,
          suppressMenuHide: true
        }))}
        rowDragManaged={true}
        allowContextMenuWithControlKey={true}
        rowData={rowData}
        suppressRowClickSelection={true}
        onGridReady={onGridReady}
        domLayout={"autoHeight"}
        defaultColDef={{
          resizable: false,
          sortable: true,
          filter: false,
          cellRenderer: "cellRenderer"
        }}
        onCellEditingStopped={(event: CellEditingStoppedEvent) => {
          // TODO: The better way to do this is to just update the account in
          // the store and let the changes take affect?
          const field = event.column.getColId();
          if (event.node.data.exists === false) {
            const existing: IRow | undefined = find(rowData, { id: event.node.data.id });
            if (isNil(existing)) {
              /* eslint-disable no-console */
              console.error("");
            } else {
              // NOTE: We might run into race conditions here if we are editing
              // the table cells to fast.  There might be better ways to handle
              // this.
              createAccount(budgetId, { [field]: event.newValue })
                .then((account: IAccount) => {
                  // TODO: Do we want to do this? Will this cause weird rendering
                  // with AGGrid?
                  dispatch(addBudgetAccountToStateAction(budgetId, account));
                  const newRowData = replaceInArray<IRow>(
                    rowData,
                    { id: event.node.data.id },
                    { ...existing, id: account.id }
                  );
                  setRowData(newRowData);
                })
                .catch((e: Error) => {
                  handleRequestError(e, "There was an error updating the account.");
                });
            }
          } else {
            updateAccount(event.data.id, { [field]: event.newValue })
              .then((account: IAccount) => {
                dispatch(updateBudgetAccountInStateAction(budgetId, account));
              })
              .catch((e: Error) => {
                handleRequestError(e, "There was an error updating the account.");
              });
          }
        }}
      />
      <TableFooter
        text={"Grand Total"}
        onNew={() => {
          const newRowData = [...rowData, { account_number: "", description: "", id: uuidv4(), exists: false }];
          setRowData(newRowData);
        }}
      />
    </div>
  );
};

export default AccountsTable;

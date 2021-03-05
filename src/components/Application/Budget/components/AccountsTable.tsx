import { useCallback, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { forEach, map, find, isNil, includes, filter } from "lodash";
import { v4 as uuidv4 } from "uuid";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

import { Checkbox } from "antd";
import { CheckboxChangeEvent } from "antd/lib/checkbox";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  CellEditingStoppedEvent,
  ICellRendererParams,
  CellClassParams,
  RowNode,
  GridApi,
  GridReadyEvent,
  ColumnApi
} from "ag-grid-community";

import { IconButton } from "components/control/buttons";
import { createAccount, updateAccount } from "services";
import { handleRequestError } from "store/tasks";
import { replaceInArray } from "util/arrays";

import {
  addBudgetAccountToStateAction,
  updateBudgetAccountInStateAction,
  setBudgetAccountsSearchAction,
  selectBudgetAccountsAction,
  deleteAccountAction
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

interface AccountsTableProps {
  budgetId: number;
}

const AccountsTable = ({ budgetId }: AccountsTableProps): JSX.Element => {
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const [rowData, setRowData] = useState<IRow[]>([]);
  const [columns, setColumns] = useState<ColDef[]>([]);

  const [selectedPlaceholderIds, setSelectedPlaceholderIds] = useState<string[]>([]);
  const dispatch = useDispatch();
  const accounts = useSelector((state: Redux.IApplicationStore) => state.budget.accounts.list);
  const deleting = useSelector((state: Redux.IApplicationStore) => state.budget.accounts.deleting);

  // TODO: The fact that we have to do this in order to allow the cell renderer
  // to access the state is not ideal.  If there is a better way to do this, we
  // should investigate it.  Note that we could set the selected state on the
  // IRow in the rowData, but this would cause the entire table to refresh
  // when an account is selected.
  const selected = useRef<number[]>(accounts.selected);
  const selectedPlaceholders = useRef<string[]>(selectedPlaceholderIds);

  const onGridReady = useCallback((event: GridReadyEvent): void => {
    setGridApi(event.api);
    event.api.sizeColumnsToFit();
  }, []);

  useEffect(() => {
    if (!isNil(gridApi)) {
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
          gridApi.sizeColumnsToFit();
        } else {
          setRowData([
            { account_number: "", description: "", id: uuidv4(), exists: false },
            { account_number: "", description: "", id: uuidv4(), exists: false }
          ]);
          gridApi.sizeColumnsToFit();
        }
      }
    }
  }, [accounts.data, accounts.responseWasReceived, gridApi]);

  useEffect(() => {
    setColumns([
      {
        field: "select",
        editable: false,
        headerName: "",
        width: 50
      },
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
      },
      {
        field: "delete",
        editable: false,
        headerName: "",
        width: 70
      }
    ]);
  }, []);

  useEffect(() => {
    selected.current = accounts.selected;
  }, [accounts.selected]);

  useEffect(() => {
    selectedPlaceholders.current = selectedPlaceholderIds;
  }, [selectedPlaceholderIds]);

  useEffect(() => {
    if (!isNil(gridApi)) {
      gridApi.setQuickFilter(accounts.search);
    }
  }, [accounts.search, gridApi]);

  const getCellFrameworkComponent = useCallback(() => {
    const CellRendererFramework = (params: ICellRendererParams): JSX.Element => {
      if (params.colDef.field === "select") {
        return (
          <Checkbox
            checked={
              params.node.data.exists === false
                ? includes(selectedPlaceholders.current, params.node.data.id)
                : includes(selected.current, params.node.data.id)
            }
            onChange={(e: CheckboxChangeEvent) => {
              if (e.target.checked) {
                if (params.node.data.exists === false) {
                  if (!includes(selectedPlaceholders.current, params.node.data.id)) {
                    setSelectedPlaceholderIds([...selectedPlaceholders.current, params.node.data.id]);
                    params.api.refreshCells({ force: true, rowNodes: [params.node] });
                  } else {
                    /* eslint-disable no-console */
                    console.warn(
                      `Inconsistent state!  Did not expect placeholder account ${params.node.data.id}
                      to exist in selected state.`
                    );
                  }
                } else {
                  if (!includes(accounts.selected, params.node.data.id)) {
                    dispatch(selectBudgetAccountsAction(budgetId, [...selected.current, params.node.data.id]));
                    params.api.refreshCells({ force: true, rowNodes: [params.node] });
                  } else {
                    /* eslint-disable no-console */
                    console.warn(
                      `Inconsistent state!  Did not expect account ${params.node.data.id} to exist
                      in selected state.`
                    );
                  }
                }
              } else {
                if (params.node.data.exists === false) {
                  if (includes(selectedPlaceholderIds, params.node.data.id)) {
                    setSelectedPlaceholderIds(
                      filter(selectedPlaceholders.current, (id: string) => id !== params.node.data.id)
                    );
                    params.api.refreshCells({ force: true, rowNodes: [params.node] });
                  } else {
                    /* eslint-disable no-console */
                    console.warn(
                      `Inconsistent state!  Expected placeholder account ${params.node.data.id}
                      to exist in selected state when it does not.`
                    );
                  }
                } else {
                  if (includes(selected.current, params.node.data.id)) {
                    dispatch(
                      selectBudgetAccountsAction(
                        budgetId,
                        filter(selected.current, (id: number) => id !== params.node.data.id)
                      )
                    );
                    params.api.refreshCells({ force: true, rowNodes: [params.node] });
                  } else {
                    /* eslint-disable no-console */
                    console.warn(
                      `Inconsistent state!  Expected account ${params.node.data.id} to exist
                      in selected state when it does not.`
                    );
                  }
                }
              }
            }}
          />
        );
      } else if (params.colDef.field === "delete") {
        return (
          <IconButton
            className={"dark"}
            size={"medium"}
            icon={<FontAwesomeIcon icon={faTrash} />}
            onClick={() => {
              const rowNodes: IRow[] = [];
              params.api.forEachNode((node: RowNode, index: number) => {
                if (node.data.id !== params.node.data.id) {
                  rowNodes.push({
                    id: node.data.id,
                    exists: node.data.exists,
                    account_number: node.data.account_number,
                    description: node.data.description
                  });
                }
              });
              // It is annoying that we have to maintain 2 separate sources of
              // truth.  This is also related to how we have to use references
              // for the state values used by the cell renderer.  We should figure
              // out how to improve this.
              setRowData(rowNodes);
              params.api.setRowData(rowNodes);

              // If the row is not a placeholder row, and thus it exists in the
              // database, we need to submit an API request to delete the account
              // so the change persists.
              if (params.node.data.exists !== false) {
                dispatch(deleteAccountAction(params.node.data.id));
              }
            }}
          />
        );
      } else {
        return <span>{params.value}</span>;
      }
    };
    return CellRendererFramework;
  }, [accounts.selected]);

  return (
    <div className={"ag-theme-alpine"} style={{ width: "100%", position: "relative" }}>
      <TableHeader
        search={accounts.search}
        setSearch={(value: string) => dispatch(setBudgetAccountsSearchAction(budgetId, value))}
        onDelete={() => console.log("Need to implement.")}
        onSum={() => console.log("Not yet supported.")}
        onPercentage={() => console.log("Not yet supported.")}
        saving={deleting.length !== 0}
      />
      <AgGridReact
        columnDefs={map(columns, (col: ColDef) => ({
          ...col,
          suppressMenu: true,
          suppressMenuHide: true,
          cellClass: (params: CellClassParams) => {
            if (includes(["delete", "select"], params.colDef.field)) {
              return "action-cell";
            }
            return "";
          }
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
          cellRendererFramework: getCellFrameworkComponent()
        }}
        onCellEditingStopped={(event: CellEditingStoppedEvent) => {
          // TODO: Is the better way to do this is to just update the account in
          // the store and let the changes take affect?
          const field = event.column.getColId();
          if (event.node.data.exists === false) {
            const existing: IRow | undefined = find(rowData, { id: event.node.data.id });
            if (isNil(existing)) {
              /* eslint-disable no-console */
              console.error(
                `Inconsistent State!  Expected account ${event.node.data.id} to exist
                in table data when it does not.`
              );
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

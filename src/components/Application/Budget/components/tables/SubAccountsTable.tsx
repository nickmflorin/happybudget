import { useCallback, useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { forEach, map, find, isNil, includes, filter } from "lodash";
import { v4 as uuidv4 } from "uuid";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faArrowsAltV } from "@fortawesome/free-solid-svg-icons";

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
  GridReadyEvent
} from "ag-grid-community";

import { IconButton } from "components/control/buttons";
import { createSubAccountSubAccount, createAccountSubAccount, updateSubAccount } from "services";
import { handleRequestError } from "store/tasks";
import { replaceInArray } from "util/arrays";

import { Pointer, setSubAccountsSearchAction, selectSubAccountsAction, deleteSubAccountAction } from "../../actions";
import { initialAccountState, initialSubAccountState } from "../../initialState";
import TableFooter from "./TableFooter";
import TableHeader from "./TableHeader";
import "./index.scss";

interface IRow {
  id: number;
  line: string | null;
  name: string | null;
  description: string | null;
  quantity: number | null;
  unit: Unit | null;
  multiplier: number | null;
  rate: number | null;
}

interface IPlaceholderRow {
  id: string;
  line: string | null;
  name: string | null;
  description: string | null;
  quantity: number | null;
  unit: Unit | null;
  multiplier: number | null;
  rate: number | null;
  exists: boolean;
}

function isPlaceholder(row: IRow | IPlaceholderRow): row is IPlaceholderRow {
  return (row as IPlaceholderRow).exists === false && typeof row.id === "string";
}

const createPlaceholder = (): IPlaceholderRow => ({
  name: "",
  line: "",
  unit: null,
  multiplier: null,
  rate: null,
  quantity: null,
  description: "",
  id: uuidv4(),
  exists: false
});

interface SubAccountsTableProps {
  budgetId: number;
  pointer: Pointer;
}

const SubAccountsTable = ({ budgetId, pointer }: SubAccountsTableProps): JSX.Element => {
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const [rowData, setRowData] = useState<(IRow | IPlaceholderRow)[]>([]);
  const [columns, setColumns] = useState<ColDef[]>([]);

  const [selectedPlaceholderIds, setSelectedPlaceholderIds] = useState<string[]>([]);
  const dispatch = useDispatch();

  // Temporary - need to build in the redux store.
  const deleting = [];
  const updating = [];

  const subaccounts = useSelector((state: Redux.IApplicationStore) => {
    if (pointer.accountId !== undefined) {
      let subState = initialAccountState;
      if (!isNil(state.budget.accounts.details[pointer.accountId])) {
        subState = state.budget.accounts.details[pointer.accountId];
      }
      return subState.subaccounts;
    } else {
      let subState = initialSubAccountState;
      if (!isNil(state.budget.subaccounts[pointer.subaccountId])) {
        subState = state.budget.subaccounts[pointer.subaccountId];
      }
      return subState.subaccounts;
    }
  });

  // TODO: The fact that we have to do this in order to allow the cell renderer
  // to access the state is not ideal.  If there is a better way to do this, we
  // should investigate it.  Note that we could set the selected state on the
  // IRow in the rowData, but this would cause the entire table to refresh
  // when an subaccount is selected.
  const selected = useRef<number[]>(subaccounts.selected);
  const selectedPlaceholders = useRef<string[]>(selectedPlaceholderIds);

  const history = useHistory();

  const onGridReady = useCallback((event: GridReadyEvent): void => {
    setGridApi(event.api);
    event.api.sizeColumnsToFit();
  }, []);

  useEffect(() => {
    if (!isNil(gridApi)) {
      if (subaccounts.responseWasReceived === true) {
        if (subaccounts.data.length !== 0) {
          const tableData: (IRow | IPlaceholderRow)[] = [];

          // We cannot merely convert the subaccounts data to rows and set that
          // as the row data because we have the placeholder cells to worry about.
          forEach(rowData, (row: IRow | IPlaceholderRow) => {
            if (isPlaceholder(row)) {
              tableData.push(row);
            } else {
              // Only add the row back into the table data if it is also present
              // in the updated set of subaccounts.  Otherwise, it should be removed.
              const existing: ISubAccount | undefined = find(subaccounts.data, { id: row.id });
              if (!isNil(existing)) {
                tableData.push({
                  name: existing.name,
                  quantity: existing.quantity,
                  unit: existing.unit,
                  multiplier: existing.multiplier,
                  rate: existing.rate,
                  line: existing.line,
                  description: existing.description,
                  id: existing.id
                });
              }
            }
          });
          // Add the leftover subaccounts to the table that were not there before.
          forEach(subaccounts.data, (subaccount: ISubAccount) => {
            const existing = find(tableData, { id: subaccount.id });
            if (isNil(existing)) {
              tableData.push({
                name: subaccount.name,
                quantity: subaccount.quantity,
                unit: subaccount.unit,
                multiplier: subaccount.multiplier,
                rate: subaccount.rate,
                line: subaccount.line,
                description: subaccount.description,
                id: subaccount.id
              });
            }
          });
          setRowData(tableData);
          gridApi.sizeColumnsToFit();
        } else {
          setRowData([createPlaceholder(), createPlaceholder()]);
          gridApi.sizeColumnsToFit();
        }
      }
    }
  }, [subaccounts.data, subaccounts.responseWasReceived, gridApi]);

  useEffect(() => {
    setColumns([
      {
        field: "select",
        editable: false,
        headerName: "",
        width: 50
      },
      {
        field: "expand",
        editable: false,
        headerName: "",
        width: 50
      },
      {
        field: "line",
        headerName: "Line",
        editable: true
      },
      {
        field: "description",
        headerName: "Category Description",
        editable: true
      },
      {
        field: "name",
        headerName: "Name",
        editable: true
      },
      {
        field: "quantity",
        headerName: "Quantity",
        editable: true
      },
      {
        field: "unit",
        headerName: "Unit",
        editable: true
      },
      {
        field: "multiplier",
        headerName: "X",
        editable: true
      },
      {
        field: "rate",
        headerName: "Rate",
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
        field: "delete",
        editable: false,
        headerName: "",
        width: 70
      }
    ]);
  }, []);

  useEffect(() => {
    selected.current = subaccounts.selected;
  }, [subaccounts.selected]);

  useEffect(() => {
    selectedPlaceholders.current = selectedPlaceholderIds;
  }, [selectedPlaceholderIds]);

  useEffect(() => {
    if (!isNil(gridApi)) {
      gridApi.setQuickFilter(subaccounts.search);
    }
  }, [subaccounts.search, gridApi]);

  const getCellFrameworkComponent = useCallback(() => {
    const CellRendererFramework = (params: ICellRendererParams): JSX.Element => {
      if (params.colDef.field === "select") {
        return (
          <Checkbox
            checked={
              isPlaceholder(params.node.data)
                ? includes(selectedPlaceholders.current, params.node.data.id)
                : includes(selected.current, params.node.data.id)
            }
            onChange={(e: CheckboxChangeEvent) => {
              if (e.target.checked) {
                if (isPlaceholder(params.node.data)) {
                  if (!includes(selectedPlaceholders.current, params.node.data.id)) {
                    setSelectedPlaceholderIds([...selectedPlaceholders.current, params.node.data.id]);
                    params.api.refreshCells({ force: true, rowNodes: [params.node] });
                  } else {
                    /* eslint-disable no-console */
                    console.warn(
                      `Inconsistent state!  Did not expect placeholder subaccount ${params.node.data.id}
                      to exist in selected state.`
                    );
                  }
                } else {
                  if (!includes(subaccounts.selected, params.node.data.id)) {
                    dispatch(selectSubAccountsAction([...selected.current, params.node.data.id], pointer));
                    params.api.refreshCells({ force: true, rowNodes: [params.node] });
                  } else {
                    /* eslint-disable no-console */
                    console.warn(
                      `Inconsistent state!  Did not expect subaccount ${params.node.data.id} to exist
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
                      `Inconsistent state!  Expected placeholder subaccount ${params.node.data.id}
                      to exist in selected state when it does not.`
                    );
                  }
                } else {
                  if (includes(selected.current, params.node.data.id)) {
                    dispatch(
                      selectSubAccountsAction(
                        filter(selected.current, (id: number) => id !== params.node.data.id),
                        pointer
                      )
                    );
                    params.api.refreshCells({ force: true, rowNodes: [params.node] });
                  } else {
                    /* eslint-disable no-console */
                    console.warn(
                      `Inconsistent state!  Expected subaccount ${params.node.data.id} to exist
                      in selected state when it does not.`
                    );
                  }
                }
              }
            }}
          />
        );
      } else if (params.colDef.field === "expand") {
        if (!isPlaceholder(params.node.data)) {
          return (
            <IconButton
              className={"dark"}
              size={"small"}
              icon={<FontAwesomeIcon icon={faArrowsAltV} />}
              onClick={() => history.push(`/budgets/${budgetId}/subaccounts/${params.node.data.id}`)}
            />
          );
        } else {
          return <></>;
        }
      } else if (params.colDef.field === "delete") {
        return (
          <IconButton
            className={"dark"}
            size={"small"}
            icon={<FontAwesomeIcon icon={faTrash} />}
            onClick={() => {
              const rowNodes: IRow[] = [];
              params.api.forEachNode((node: RowNode) => {
                if (node.data.id !== params.node.data.id) {
                  rowNodes.push({ ...node.data });
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
                dispatch(deleteSubAccountAction(params.node.data.id));
              }
            }}
          />
        );
      } else {
        return <span>{params.value}</span>;
      }
    };
    return CellRendererFramework;
  }, [subaccounts.selected]);

  return (
    <div className={"ag-theme-alpine"} style={{ width: "100%", position: "relative" }}>
      <TableHeader
        search={subaccounts.search}
        setSearch={(value: string) => dispatch(setSubAccountsSearchAction(value, pointer))}
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
            if (includes(["delete", "select", "expand"], params.colDef.field)) {
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
          const field = event.column.getColId();
          if (event.node.data.exists === false) {
            const existing: IRow | IPlaceholderRow | undefined = find(rowData, { id: event.node.data.id });
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
              // TODO: Instead of allowing partial fields to be undefined on the
              // model, maybe we should instead have a set of required fields and
              // only create the account when all of those fields are present.
              if (pointer.accountId !== undefined) {
                createAccountSubAccount(pointer.accountId, budgetId, { [field]: event.newValue })
                  .then((subaccount: ISubAccount) => {
                    // When the state is updated directly after an API request, via dispatching an action,
                    // it causes unnecessary rerendering of AGGridReact.  It is better to allow AGGridReact
                    // to handle the state and only use the raw data to populate the table on it's first
                    // render.  We should investigate if there are smarter ways to do this with AGGridReact.
                    const newRowData = replaceInArray<IRow | IPlaceholderRow>(
                      rowData,
                      { id: event.node.data.id },
                      { ...existing, id: subaccount.id }
                    );
                    setRowData(newRowData);
                  })
                  .catch((e: Error) => {
                    handleRequestError(e, "There was an error updating the sub account.");
                  });
              } else {
                createSubAccountSubAccount(pointer.subaccountId, { [field]: event.newValue })
                  .then((subaccount: ISubAccount) => {
                    // When the state is updated directly after an API request, via dispatching an action,
                    // it causes unnecessary rerendering of AGGridReact.  It is better to allow AGGridReact
                    // to handle the state and only use the raw data to populate the table on it's first
                    // render.  We should investigate if there are smarter ways to do this with AGGridReact.
                    const newRowData = replaceInArray<IRow | IPlaceholderRow>(
                      rowData,
                      { id: event.node.data.id },
                      { ...existing, id: subaccount.id }
                    );
                    setRowData(newRowData);
                  })
                  .catch((e: Error) => {
                    handleRequestError(e, "There was an error updating the sub account.");
                  });
              }
            }
          } else {
            // When the state is updated directly after an API request, via dispatching an action,
            // it causes unnecessary rerendering of AGGridReact.  It is better to allow AGGridReact
            // to handle the state and only use the raw data to populate the table on it's first
            // render.  We should investigate if there are smarter ways to do this with AGGridReact.
            updateSubAccount(event.data.id, { [field]: event.newValue }).catch((e: Error) => {
              handleRequestError(e, "There was an error updating the sub account.");
            });
          }
        }}
      />
      <TableFooter
        text={"Grand Total"}
        onNew={() => {
          const newRowData = [...rowData, createPlaceholder()];
          setRowData(newRowData);
        }}
      />
    </div>
  );
};

export default SubAccountsTable;

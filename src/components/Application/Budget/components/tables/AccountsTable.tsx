import { useCallback, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { map, isNil, includes, find } from "lodash";

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
  GridApi,
  GridReadyEvent,
  RowNode
} from "ag-grid-community";

import { IconButton } from "components/control/buttons";

import {
  setAccountsSearchAction,
  removeAccountsRowAction,
  updateAccountsRowAction,
  addAccountsRowAction,
  selectAccountsRowAction,
  deselectAccountsRowAction
} from "../../actions";
import TableFooter from "./TableFooter";
import TableHeader from "./TableHeader";
import "./index.scss";

interface AccountsTableProps {
  budgetId: number;
}

const AccountsTable = ({ budgetId }: AccountsTableProps): JSX.Element => {
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const [columns, setColumns] = useState<ColDef[]>([]);
  const dispatch = useDispatch();
  const history = useHistory();

  const accountsStore: Redux.Budget.IAccountsStore = useSelector(
    (state: Redux.IApplicationStore) => state.budget.accounts
  );

  const onGridReady = useCallback((event: GridReadyEvent): void => {
    setGridApi(event.api);
  }, []);

  useEffect(() => {
    if (!isNil(gridApi)) {
      gridApi.sizeColumnsToFit();
    }
  }, [accountsStore.table, gridApi]);

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
    if (!isNil(gridApi)) {
      gridApi.setQuickFilter(accountsStore.list.search);
    }
  }, [accountsStore.list.search, gridApi]);

  useEffect(() => {
    // Changes to the selected rows does not trigger a refresh of those cells
    // via AGGridReact because AGGridReact cannot detect changes to an HTML checkbox
    // as a change to the value of a cell.  Therefore, we must trigger the refresh
    // manually.
    if (!isNil(gridApi)) {
      gridApi.forEachNode((node: RowNode) => {
        const existing = find(accountsStore.table, { id: node.data.id });
        if (!isNil(existing)) {
          if (existing.selected !== node.data.selected) {
            gridApi.refreshCells({ force: true, rowNodes: [node] });
          }
        }
      });
    }
  }, [accountsStore.table, gridApi]);

  const getCellFrameworkComponent = () => {
    const CellRendererFramework = (params: ICellRendererParams): JSX.Element => {
      if (params.colDef.field === "select") {
        return (
          <Checkbox
            checked={params.node.data.selected}
            onChange={(e: CheckboxChangeEvent) => {
              if (e.target.checked) {
                dispatch(selectAccountsRowAction(params.node.data.id));
              } else {
                dispatch(deselectAccountsRowAction(params.node.data.id));
              }
            }}
          />
        );
      } else if (params.colDef.field === "expand") {
        if (params.node.data.isPlaceholder === false) {
          return (
            <IconButton
              className={"dark"}
              size={"small"}
              icon={<FontAwesomeIcon icon={faArrowsAltV} />}
              onClick={() => history.push(`/budgets/${budgetId}/accounts/${params.node.data.id}`)}
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
            onClick={() => dispatch(removeAccountsRowAction(params.node.data))}
          />
        );
      } else {
        return <span>{params.value}</span>;
      }
    };
    return CellRendererFramework;
  };

  return (
    <div className={"ag-theme-alpine"} style={{ width: "100%", position: "relative" }}>
      <TableHeader
        search={accountsStore.list.search}
        setSearch={(value: string) => dispatch(setAccountsSearchAction(value))}
        onDelete={() => console.log("Need to implement.")}
        onSum={() => console.log("Not yet supported.")}
        onPercentage={() => console.log("Not yet supported.")}
        saving={accountsStore.deleting.length !== 0 || accountsStore.updating.length !== 0 || accountsStore.creating}
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
        rowData={accountsStore.table}
        getRowNodeId={(data: any) => data.id}
        immutableData={true}
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
          dispatch(updateAccountsRowAction(budgetId, { id: event.data.id, payload: { [field]: event.newValue } }));
        }}
      />
      <TableFooter text={"Grand Total"} onNew={() => dispatch(addAccountsRowAction())} />
    </div>
  );
};

export default AccountsTable;

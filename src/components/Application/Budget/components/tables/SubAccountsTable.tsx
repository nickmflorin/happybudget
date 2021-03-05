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
  Pointer,
  setSubAccountsSearchAction,
  removeSubAccountsRowAction,
  updateSubAccountsRowAction,
  addAccountSubAccountsRowAction,
  selectSubAccountsRowAction,
  deselectSubAccountsRowAction
} from "../../actions";
import { initialAccountState, initialSubAccountState } from "../../initialState";
import TableFooter from "./TableFooter";
import TableHeader from "./TableHeader";
import "./index.scss";

interface SubAccountsTableProps {
  budgetId: number;
  pointer: Pointer;
}

const SubAccountsTable = ({ budgetId, pointer }: SubAccountsTableProps): JSX.Element => {
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const [columns, setColumns] = useState<ColDef[]>([]);
  const dispatch = useDispatch();
  const history = useHistory();

  const subAccountsStore: Redux.Budget.ISubAccountListResponseStore = useSelector((state: Redux.IApplicationStore) => {
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

  const rowData = useSelector((state: Redux.IApplicationStore) => state.budget.subaccountsTable);

  const onGridReady = useCallback((event: GridReadyEvent): void => {
    setGridApi(event.api);
  }, []);

  useEffect(() => {
    if (!isNil(gridApi)) {
      gridApi.sizeColumnsToFit();
    }
  }, [rowData, gridApi]);

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
    if (!isNil(gridApi)) {
      gridApi.setQuickFilter(subAccountsStore.list.search);
    }
  }, [subAccountsStore.list.search, gridApi]);

  useEffect(() => {
    // Changes to the selected rows does not trigger a refresh of those cells
    // via AGGridReact because AGGridReact cannot detect changes to an HTML checkbox
    // as a change to the value of a cell.  Therefore, we must trigger the refresh
    // manually.
    if (!isNil(gridApi)) {
      gridApi.forEachNode((node: RowNode) => {
        const existing = find(rowData, { id: node.data.id });
        if (!isNil(existing)) {
          if (existing.selected !== node.data.selected) {
            gridApi.refreshCells({ force: true, rowNodes: [node] });
          }
        }
      });
    }
  }, [rowData, gridApi]);

  const getCellFrameworkComponent = useCallback(() => {
    const CellRendererFramework = (params: ICellRendererParams): JSX.Element => {
      if (params.colDef.field === "select") {
        return (
          <Checkbox
            checked={params.node.data.selected}
            onChange={(e: CheckboxChangeEvent) => {
              if (e.target.checked) {
                dispatch(selectSubAccountsRowAction(params.node.data.id, pointer));
              } else {
                dispatch(deselectSubAccountsRowAction(params.node.data.id, pointer));
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
            onClick={() => dispatch(removeSubAccountsRowAction(params.node.data, pointer))}
          />
        );
      } else {
        return <span>{params.value}</span>;
      }
    };
    return CellRendererFramework;
  }, [subAccountsStore.list.selected]);

  return (
    <div className={"ag-theme-alpine"} style={{ width: "100%", position: "relative" }}>
      <TableHeader
        search={subAccountsStore.list.search}
        setSearch={(value: string) => dispatch(setSubAccountsSearchAction(value, pointer))}
        onDelete={() => console.log("Need to implement.")}
        onSum={() => console.log("Not yet supported.")}
        onPercentage={() => console.log("Not yet supported.")}
        saving={
          subAccountsStore.deleting.length !== 0 || subAccountsStore.updating.length !== 0 || subAccountsStore.creating
        }
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
          dispatch(updateSubAccountsRowAction(event.data.id, budgetId, { [field]: event.newValue }, pointer));
        }}
      />
      <TableFooter text={"Grand Total"} onNew={() => dispatch(addAccountSubAccountsRowAction())} />
    </div>
  );
};

export default SubAccountsTable;

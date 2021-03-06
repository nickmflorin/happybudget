import { useCallback, useState, useEffect } from "react";
import { map, isNil, includes, find, concat, uniq, forEach, filter } from "lodash";

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
import TableFooter from "./TableFooter";
import TableHeader from "./TableHeader";
import "./index.scss";

interface GenericBudgetTableProps<R> {
  columns: ColDef[];
  table: R[];
  search: string;
  saving: boolean;
  onSearch: (value: string) => void;
  onRowSelect: (id: number | string) => void;
  onRowDeselect: (id: number | string) => void;
  onRowUpdate: (id: number | string, payload: { [key: string]: any }) => void;
  onRowAdd: () => void;
  onRowDelete: (row: R) => void;
  onRowExpand: (id: number) => void;
  onSelectAll: () => void;
}

const GenericBudgetTable = <R extends Redux.Budget.IRow>({
  columns,
  table,
  search,
  saving,
  onSearch,
  onSelectAll,
  onRowUpdate,
  onRowSelect,
  onRowDeselect,
  onRowAdd,
  onRowDelete,
  onRowExpand
}: GenericBudgetTableProps<R>) => {
  const [allSelected, setAllSelected] = useState(false);
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);

  const onGridReady = useCallback((event: GridReadyEvent): void => {
    setGridApi(event.api);
  }, []);

  useEffect(() => {
    if (!isNil(gridApi)) {
      gridApi.sizeColumnsToFit();
    }
  }, [table, gridApi]);

  useEffect(() => {
    if (!isNil(gridApi)) {
      gridApi.setQuickFilter(search);
    }
  }, [search, gridApi]);

  useEffect(() => {
    // Changes to the selected rows does not trigger a refresh of those cells
    // via AGGridReact because AGGridReact cannot detect changes to an HTML checkbox
    // as a change to the value of a cell.  Therefore, we must trigger the refresh
    // manually.
    if (!isNil(gridApi)) {
      gridApi.forEachNode((node: RowNode) => {
        const existing = find(table, { id: node.data.id });
        if (!isNil(existing)) {
          if (existing.selected !== node.data.selected) {
            gridApi.refreshCells({ force: true, rowNodes: [node] });
          }
        }
      });
    }
  }, [table, gridApi]);

  const getCellFrameworkComponent = () => {
    const CellRendererFramework = (params: ICellRendererParams): JSX.Element => {
      if (params.colDef.field === "select") {
        return (
          <Checkbox
            checked={params.node.data.selected}
            onChange={(e: CheckboxChangeEvent) => {
              if (e.target.checked) {
                onRowSelect(params.node.data.id);
              } else {
                onRowDeselect(params.node.data.id);
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
              onClick={() => onRowExpand(params.node.data.id)}
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
            onClick={() => onRowDelete(params.node.data)}
          />
        );
      } else {
        return <span>{params.value}</span>;
      }
    };
    return CellRendererFramework;
  };

  useEffect(() => {
    const mapped = map(table, (row: R) => row.selected);
    const uniques = uniq(mapped);
    if (uniques.length === 1 && uniques[0] === true) {
      setAllSelected(true);
    } else {
      setAllSelected(false);
    }
  }, [table]);

  return (
    <div className={"ag-theme-alpine"} style={{ width: "100%", position: "relative" }}>
      <TableHeader
        search={search}
        setSearch={(value: string) => onSearch(value)}
        onDelete={() => {
          forEach(table, (row: R) => {
            if (row.selected === true) {
              onRowDelete(row);
            }
          });
        }}
        saving={saving}
        selected={allSelected}
        onSelect={onSelectAll}
        deleteDisabled={filter(table, (row: R) => row.selected === true).length === 0}
      />
      <AgGridReact
        columnDefs={map(
          concat(
            [
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
              }
            ],
            columns,
            [
              {
                field: "delete",
                editable: false,
                headerName: "",
                width: 70
              }
            ]
          ),
          (col: ColDef) => ({
            ...col,
            suppressMenu: true,
            suppressMenuHide: true,
            cellClass: (params: CellClassParams) => {
              if (includes(["delete", "select", "expand"], params.colDef.field)) {
                return "action-cell";
              }
              return "";
            }
          })
        )}
        rowDragManaged={true}
        allowContextMenuWithControlKey={true}
        rowData={table}
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
          onRowUpdate(event.data.id, { [field]: event.newValue });
        }}
      />
      <TableFooter text={"Grand Total"} onNew={() => onRowAdd()} />
    </div>
  );
};

export default GenericBudgetTable;

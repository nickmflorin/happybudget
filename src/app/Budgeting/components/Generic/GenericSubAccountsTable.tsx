import { isNil, includes, find, filter, map } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSigma, faPercentage, faUpload, faTrashAlt } from "@fortawesome/pro-solid-svg-icons";

import { ColDef, ColSpanParams, SuppressKeyboardEventParams } from "@ag-grid-community/core";

import { getKeyValue } from "lib/util";
import { inferModelFromName } from "lib/model/util";
import { currencyValueFormatter } from "lib/model/formatters";
import { floatValueSetter, integerValueSetter } from "lib/model/valueSetters";

import BudgetTableComponent from "../BudgetTable";

export interface GenericSubAccountsTableProps<R extends Table.Row, M extends Model.SubAccount, G extends Model.Group>
  extends Omit<
    BudgetTable.Props<R, M, G, Http.SubAccountPayload>,
    "identifierField" | "identifierFieldHeader" | "groupParams" | "rowCanExpand"
  > {
  categoryName: "Sub Account" | "Detail";
  identifierFieldHeader: "Account" | "Line";
  fringes: Model.Fringe[];
  fringesCellRenderer: "BudgetFringesCell" | "TemplateFringesCell";
  fringesCellEditor: "BudgetFringesCellEditor" | "TemplateFringesCellEditor";
  fringesCellEditorParams: {
    colId: keyof R;
    onAddFringes: () => void;
  };
  subAccountUnits: Model.Tag[];
  onGroupRows: (rows: R[]) => void;
  onDeleteGroup: (group: G) => void;
  onEditGroup: (group: G) => void;
  onRowRemoveFromGroup: (row: R) => void;
  onRowAddToGroup: (group: number, row: R) => void;
  onEditFringes: () => void;
}

const GenericSubAccountsTable = <
  R extends BudgetTable.SubAccountRow,
  M extends Model.SubAccount,
  G extends Model.Group
>({
  /* eslint-disable indent */
  categoryName,
  identifierFieldHeader,
  fringes,
  fringesCellEditor,
  fringesCellRenderer,
  fringesCellEditorParams,
  subAccountUnits,
  onGroupRows,
  onDeleteGroup,
  onEditGroup,
  onRowRemoveFromGroup,
  onRowAddToGroup,
  onEditFringes,
  ...props
}: GenericSubAccountsTableProps<R, M, G>): JSX.Element => {
  return (
    <BudgetTableComponent<R, M, G, Http.SubAccountPayload>
      sizeColumnsToFit={false}
      identifierField={"identifier"}
      identifierFieldHeader={identifierFieldHeader}
      identifierColumn={{ width: 70, cellRendererParams: { className: "subaccount-identifier" } }}
      isCellEditable={(row: R, colDef: ColDef) => {
        if (includes(["identifier", "description", "name"], colDef.field)) {
          return true;
        } else {
          return row.meta.children.length === 0;
        }
      }}
      groupParams={{
        onDeleteGroup,
        onRowRemoveFromGroup,
        onGroupRows,
        onEditGroup,
        onRowAddToGroup
      }}
      rowCanExpand={(row: R) => row.identifier !== null || row.meta.children.length !== 0}
      actions={(params: BudgetTable.MenuActionParams<R>) => [
        {
          tooltip: "Delete",
          icon: <FontAwesomeIcon icon={faTrashAlt} />,
          disabled: params.selectedRows.length === 0,
          onClick: params.onDelete
        },
        {
          tooltip: "Sub-Total",
          icon: <FontAwesomeIcon icon={faSigma} />,
          disabled: true
        },
        {
          tooltip: "Mark Up",
          icon: <FontAwesomeIcon icon={faPercentage} />,
          disabled: true
        },
        {
          tooltip: "Import",
          icon: <FontAwesomeIcon icon={faUpload} />,
          disabled: true
        }
      ]}
      {...props}
      columns={[
        {
          field: "description",
          headerName: `${categoryName} Description`,
          flex: 100,
          type: "longText",
          colSpan: (params: ColSpanParams) => {
            const row: BudgetTable.TemplateSubAccountRow = params.data;
            if (!isNil(params.data.meta) && !isNil(params.data.meta.children)) {
              return row.meta.children.length !== 0 ? 7 : 1;
            }
            return 1;
          }
        },
        {
          field: "name",
          headerName: "Contact",
          width: 120,
          type: "contact"
        },
        {
          field: "quantity",
          headerName: "Qty",
          width: 60,
          valueSetter: integerValueSetter<BudgetTable.TemplateSubAccountRow>("quantity"),
          type: "number"
        },
        {
          field: "unit",
          headerName: "Unit",
          cellClass: "cell--centered",
          cellRenderer: "SubAccountUnitCell",
          width: 100,
          cellEditor: "SubAccountUnitCellEditor",
          type: "singleSelect",
          // Required to allow the dropdown to be selectable on Enter key.
          suppressKeyboardEvent: (params: SuppressKeyboardEventParams) => {
            if ((params.event.code === "Enter" || params.event.code === "Tab") && params.editing) {
              return true;
            }
            return false;
          },
          processCellForClipboard: (row: R) => {
            const unit = getKeyValue<R, keyof R>("unit")(row);
            if (isNil(unit)) {
              return "";
            }
            return unit.name;
          },
          processCellFromClipboard: (name: string) => {
            if (name.trim() === "") {
              return null;
            } else {
              const unit = find(subAccountUnits, { title: name });
              if (!isNil(unit)) {
                return unit;
              }
              return null;
            }
          }
        },
        {
          field: "multiplier",
          headerName: "X",
          width: 50,
          valueSetter: floatValueSetter<BudgetTable.TemplateSubAccountRow>("multiplier"),
          type: "number"
        },
        {
          field: "rate",
          headerName: "Rate",
          width: 100,
          valueFormatter: currencyValueFormatter,
          valueSetter: floatValueSetter<BudgetTable.TemplateSubAccountRow>("rate"),
          type: "currency"
        },
        {
          field: "fringes",
          headerName: "Fringes",
          cellClass: classNames("cell--centered"),
          cellRenderer: fringesCellRenderer,
          headerComponentParams: {
            onEdit: () => onEditFringes()
          },
          minWidth: 150,
          nullValue: [],
          cellEditor: fringesCellEditor,
          cellEditorParams: fringesCellEditorParams,
          type: "singleSelect",
          processCellFromClipboard: (value: string) => {
            // NOTE: When pasting from the clipboard, the values will be a comma-separated
            // list of Fringe Names (assuming a rational user).  Currently, Fringe Names are
            // enforced to be unique, so we can map the Name back to the ID.  However, this might
            // not always be the case, in which case this logic breaks down.
            const names = value.split(",");
            const fs: Model.Fringe[] = filter(
              map(names, (name: string) => inferModelFromName<Model.Fringe>(fringes, name)),
              (f: Model.Fringe | null) => f !== null
            ) as Model.Fringe[];
            return map(fs, (f: Model.Fringe) => f.id);
          },
          processCellForClipboard: (row: R) => {
            const subAccountFringes: Model.Fringe[] = filter(
              map(row.fringes, (id: number) => {
                const fringe: Model.Fringe | undefined = find(fringes, { id });
                if (!isNil(fringe)) {
                  return fringe;
                } else {
                  /* eslint-disable no-console */
                  console.error(
                    `Corrupted Cell Found! Could not convert model value ${id} for field fringes
                    to a name.`
                  );
                  return null;
                }
              }),
              (fringe: Model.Fringe | null) => fringe !== null
            ) as Model.Fringe[];
            return map(subAccountFringes, (fringe: Model.Fringe) => fringe.name).join(", ");
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

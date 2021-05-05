import { isNil, includes, find, filter, map } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSigma, faPercentage, faUpload, faTrashAlt } from "@fortawesome/pro-solid-svg-icons";

import { ColDef, ColSpanParams, ValueSetterParams } from "@ag-grid-community/core";

import { SubAccountUnits } from "lib/model";
import { currencyValueFormatter } from "lib/tabling/formatters";
import { floatValueSetter, integerValueSetter, choiceModelValueSetter } from "lib/tabling/valueSetters";

import BudgetTable, { BudgetTableProps, BudgetTableActionsParams } from "../BudgetTable";

export interface GenericSubAccountsTableProps<R extends Table.Row<G>, M extends Model.SubAccount, G extends Model.Group>
  extends Omit<
    BudgetTableProps<R, M, G, Http.SubAccountPayload>,
    "identifierField" | "identifierFieldHeader" | "groupParams"
  > {
  categoryName: "Account" | "Detail";
  fringes: Model.Fringe[];
  fringesCellRenderer: "BudgetFringesCell" | "TemplateFringesCell";
  fringesCellRendererParams: {
    onAddFringes: () => void;
  };
  onGroupRows: (rows: R[]) => void;
  onDeleteGroup: (group: G) => void;
  onEditGroup: (group: G) => void;
  onRowRemoveFromGroup: (row: R) => void;
  onRowAddToGroup: (group: number, row: R) => void;
  onEditFringes: () => void;
}

const GenericSubAccountsTable = <R extends Table.SubAccountRow<G>, M extends Model.SubAccount, G extends Model.Group>({
  categoryName,
  fringes,
  fringesCellRenderer,
  fringesCellRendererParams,
  onGroupRows,
  onDeleteGroup,
  onEditGroup,
  onRowRemoveFromGroup,
  onRowAddToGroup,
  onEditFringes,
  ...props
}: GenericSubAccountsTableProps<R, M, G>): JSX.Element => {
  return (
    <BudgetTable<R, M, G, Http.SubAccountPayload>
      sizeColumnsToFit={false}
      identifierField={"identifier"}
      identifierFieldHeader={"Line"}
      identifierColumn={{ width: 70, cellRendererParams: { className: "subaccount-identifier" } }}
      isCellEditable={(row: R, colDef: ColDef) => {
        if (includes(["identifier", "description", "name"], colDef.field)) {
          return true;
        } else {
          return row.meta.children.length === 0;
        }
      }}
      rowRefreshRequired={(existing: R, row: R) => existing.unit !== row.unit}
      groupParams={{
        onDeleteGroup,
        onRowRemoveFromGroup,
        onGroupRows,
        onEditGroup,
        onRowAddToGroup
      }}
      processCellForClipboard={{
        fringes: (row: R) => {
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
        }
      }}
      actions={(params: BudgetTableActionsParams<R, G>) => [
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
          colSpan: (params: ColSpanParams) => {
            const row: Table.TemplateSubAccountRow = params.data;
            if (!isNil(params.data.meta) && !isNil(params.data.meta.children)) {
              return row.meta.children.length !== 0 ? 7 : 1;
            }
            return 1;
          }
        },
        {
          field: "name",
          headerName: "Name",
          width: 80
        },
        {
          field: "quantity",
          headerName: "Qty",
          width: 60,
          cellStyle: { textAlign: "right" },
          valueSetter: integerValueSetter<Table.TemplateSubAccountRow>("quantity")
        },
        {
          field: "unit",
          headerName: "Unit",
          cellClass: "cell--centered",
          cellRenderer: "SubAccountUnitCell",
          width: 100,
          valueSetter: choiceModelValueSetter<Table.TemplateSubAccountRow, Model.SubAccountUnit>(
            "unit",
            SubAccountUnits,
            {
              allowNull: true
            }
          )
        },
        {
          field: "multiplier",
          headerName: "X",
          width: 50,
          cellStyle: { textAlign: "right" },
          valueSetter: floatValueSetter<Table.TemplateSubAccountRow>("multiplier")
        },
        {
          field: "rate",
          headerName: "Rate",
          width: 70,
          cellStyle: { textAlign: "right" },
          valueFormatter: currencyValueFormatter,
          valueSetter: floatValueSetter<Table.TemplateSubAccountRow>("rate")
        },
        {
          field: "fringes",
          headerName: "Fringes",
          cellClass: classNames("cell--centered"),
          cellRenderer: fringesCellRenderer,
          cellRendererParams: fringesCellRendererParams,
          headerComponentParams: {
            onEdit: () => onEditFringes()
          },
          minWidth: 150,
          onClearValue: [],
          valueSetter: (params: ValueSetterParams): boolean => {
            // In the case that the value is an Array, the value will have been  provided as an Array
            // of IDs from the Fringes dropdown.
            if (Array.isArray(params.newValue)) {
              params.data.fringes = params.newValue;
              return true;
            } else if (params.newValue === undefined) {
              // In the case that the user clears the cell via a backspace, the value will be undefined.
              params.data.fringes = [];
              return true;
            } else if (typeof params.newValue === "string") {
              // In the case that the value is a string, it will have been provided from the user
              // editing the cell manually or via Copy/Paste, because the processCellForClipboard
              // formats the value as a comma-separated list of names.
              const names = params.newValue.split(",");
              const fringeIds: number[] = filter(
                map(names, (name: string) => {
                  const fringe: Model.Fringe | undefined = find(fringes, (fr: Model.Fringe) => fr.name === name.trim());
                  if (!isNil(fringe)) {
                    return fringe.id;
                  }
                  return null;
                }),
                (value: number | null) => value !== null
              ) as number[];
              params.data.fringes = fringeIds;
              return true;
            } else {
              return false;
            }
          }
        },
        ...props.columns
      ]}
    />
  );
};

export default GenericSubAccountsTable;

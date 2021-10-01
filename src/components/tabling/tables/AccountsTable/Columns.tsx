import { tabling } from "lib";

import { Icon } from "components";
import { framework } from "components/tabling/generic";
import { framework as budgetFramework } from "../BudgetTable";

type R = Tables.AccountRowData;
type M = Model.Account;

const Columns: Table.Column<R, M>[] = [
  budgetFramework.columnObjs.IdentifierColumn<R, M>({
    field: "identifier",
    headerName: "Account"
  }),
  framework.columnObjs.BodyColumn<R, M>({
    field: "description",
    headerName: "Account Description",
    minWidth: 200,
    flex: 100,
    columnType: "longText",
    cellRenderer: "BodyCell",
    cellRendererParams: {
      icon: (row: Table.BodyRow<R>) =>
        tabling.typeguards.isMarkupRow(row) ? <Icon icon={"percentage"} weight={"light"} /> : undefined
    }
  }),
  budgetFramework.columnObjs.EstimatedColumn<R, M>({}),
  budgetFramework.columnObjs.ActualColumn<R, M>({}),
  budgetFramework.columnObjs.VarianceColumn<R, M>({}),
  framework.columnObjs.FakeColumn<R, M>({ field: "nominal_value" }),
  framework.columnObjs.FakeColumn<R, M>({ field: "markup_contribution" }),
  framework.columnObjs.FakeColumn<R, M>({ field: "accumulated_fringe_contribution" }),
  framework.columnObjs.FakeColumn<R, M>({ field: "accumulated_markup_contribution" })
];

export default Columns;

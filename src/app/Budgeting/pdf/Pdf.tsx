import { Document } from "@react-pdf/renderer";
import { isNil, map, filter } from "lodash";

import * as models from "lib/model";
import * as formatters from "lib/model/formatters";

import { View, Page } from "./Base";
import { AccountsTable, AccountTable } from "./Tables";
import PdfTag from "./PdfTag";

const BudgetPdf = (budget: Model.PdfBudget, options: BudgetPdf.Options) => {
  console.log(budget);
  return (
    <Document>
      <Page title={budget.name} subTitle={"Cost Summary"}>
        <View style={{ marginTop: 20 }}>
          <AccountsTable
            options={options}
            data={budget.accounts}
            groups={budget.groups}
            manager={models.PdfAccountRowManager}
            columns={[
              {
                field: "identifier",
                headerName: "Acct #",
                type: "text",
                width: "10%",
                cellProps: { textStyle: { textAlign: "center" } }
              },
              {
                field: "description",
                headerName: "Category Description",
                type: "longText",
                width: "75%",
                footer: {
                  value: "Grand Total"
                }
              },
              {
                field: "estimated",
                headerName: "Estimated",
                isCalculated: true,
                type: "sum",
                formatter: formatters.currencyValueFormatter,
                width: "15%",
                footer: {
                  value: !isNil(budget.estimated) ? budget.estimated : 0.0
                }
              }
            ]}
          />
        </View>
      </Page>
      <Page>
        {map(
          filter(
            budget.accounts,
            (account: Model.PdfAccount) => !(options.excludeZeroTotals === true) || account.estimated !== 0
          ),
          (account: Model.PdfAccount, index: number) => (
            <View key={index} style={index !== 0 ? { marginTop: 20 } : {}}>
              <AccountTable
                account={account}
                options={options}
                manager={models.PdfSubAccountRowManager}
                columns={[
                  {
                    field: "identifier",
                    type: "number",
                    headerName: "Acct",
                    width: "10%",
                    cellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } }
                  },
                  {
                    field: "description",
                    headerName: "Description",
                    type: "longText",
                    width: "30%",
                    footer: {
                      /* eslint-disable indent */
                      value: !isNil(account.description)
                        ? `${account.description} Total`
                        : !isNil(account.identifier)
                        ? `${account.identifier} Total`
                        : "Total"
                    },
                    childFooter: (model: Model.PdfSubAccount) => {
                      if (!isNil(model.description)) {
                        return { value: `${model.description} Total` };
                      } else if (!isNil(model.identifier)) {
                        return { value: `${model.identifier} Total` };
                      }
                      return { value: "Total" };
                    }
                  },
                  {
                    field: "name",
                    headerName: "Contact",
                    type: "contact",
                    width: "10%"
                  },
                  {
                    field: "quantity",
                    headerName: "Qty",
                    type: "number",
                    width: "10%"
                  },
                  {
                    field: "unit",
                    headerName: "Unit",
                    type: "singleSelect",
                    width: "10%",
                    cellRenderer: (
                      params: Table.PdfCellCallbackParams<
                        BudgetPdf.SubAccountRow,
                        Model.PdfSubAccount,
                        Model.PdfSubAccount
                      >
                    ) => (params.rawValue !== null ? <PdfTag model={params.rawValue} /> : <span></span>)
                  },
                  {
                    field: "multiplier",
                    headerName: "X",
                    type: "number",
                    width: "10%"
                  },
                  {
                    field: "rate",
                    headerName: "Rate",
                    formatter: formatters.currencyValueFormatter,
                    type: "currency",
                    width: "10%"
                  },
                  {
                    field: "estimated",
                    headerName: "Total",
                    isCalculated: true,
                    type: "sum",
                    width: "10%",
                    formatter: formatters.currencyValueFormatter,
                    footer: {
                      value: !isNil(account.estimated) ? account.estimated : 0.0
                    },
                    childFooter: (model: Model.PdfSubAccount) => {
                      return { value: !isNil(model.estimated) ? model.estimated : 0.0 };
                    }
                  }
                ]}
              />
            </View>
          )
        )}
      </Page>
    </Document>
  );
};

export default BudgetPdf;

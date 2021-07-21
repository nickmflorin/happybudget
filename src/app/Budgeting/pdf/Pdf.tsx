import { Document } from "@react-pdf/renderer";
import { isNil, map, filter, find } from "lodash";

import * as formatters from "lib/model/formatters";
import { View, Page, Tag } from "components/pdf";
import { AccountsTable, AccountTable } from "./Tables";

const BudgetPdf = (budget: Model.PdfBudget, contacts: Model.Contact[], options: PdfBudgetTable.Options) => {
  return (
    <Document>
      <Page title={budget.name} subTitle={"Cost Summary"}>
        <View style={{ marginTop: 20 }}>
          <AccountsTable
            options={options}
            data={filter(
              budget.accounts,
              (account: Model.PdfAccount) => !(options.excludeZeroTotals === true) || account.estimated !== 0
            )}
            groups={budget.groups}
            columns={[
              {
                field: "identifier",
                headerName: "Acct #",
                columnType: "text",
                width: "10%",
                cellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } }
              },
              {
                field: "description",
                headerName: "Category Description",
                columnType: "longText",
                width: "75%",
                footer: {
                  value: "Grand Total"
                }
              },
              {
                field: "estimated",
                headerName: "Estimated",
                isCalculated: true,
                columnType: "sum",
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
                columns={[
                  {
                    field: "identifier",
                    columnType: "number",
                    headerName: "Acct",
                    width: "10%",
                    cellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } }
                  },
                  {
                    field: "description",
                    headerName: "Description",
                    columnType: "longText",
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
                    field: "contact",
                    headerName: "Contact",
                    columnType: "contact",
                    width: "10%",
                    cellRenderer: (
                      params: PdfTable.CellCallbackParams<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>
                    ) => {
                      if (params.rawValue !== null) {
                        const contact: Model.Contact | undefined = find(contacts, { id: params.rawValue });
                        if (!isNil(contact)) {
                          return (
                            <Tag
                              className={"tag tag--contact"}
                              color={"#EFEFEF"}
                              textColor={"#2182e4"}
                              text={contact.full_name}
                            />
                          );
                        }
                      }
                      return <span></span>;
                    }
                  },
                  {
                    field: "quantity",
                    headerName: "Qty",
                    columnType: "number",
                    width: "10%"
                  },
                  {
                    field: "unit",
                    headerName: "Unit",
                    columnType: "singleSelect",
                    width: "10%",
                    cellRenderer: (
                      params: PdfTable.CellCallbackParams<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>
                    ) => {
                      return params.rawValue !== null ? (
                        <Tag className={"tag"} model={params.rawValue} />
                      ) : (
                        <span></span>
                      );
                    }
                  },
                  {
                    field: "multiplier",
                    headerName: "X",
                    columnType: "number",
                    width: "10%"
                  },
                  {
                    field: "rate",
                    headerName: "Rate",
                    formatter: formatters.currencyValueFormatter,
                    columnType: "currency",
                    width: "10%"
                  },
                  {
                    field: "estimated",
                    headerName: "Total",
                    isCalculated: true,
                    columnType: "sum",
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

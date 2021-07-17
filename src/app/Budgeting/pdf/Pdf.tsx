import { Document } from "@react-pdf/renderer";
import { isNil, map, filter, find } from "lodash";

import * as formatters from "lib/model/formatters";
import { View, Page, Tag } from "components/pdf";
import { AccountsTable, AccountTable } from "./Tables";

const BudgetPdf = (budget: Model.PdfBudget, contacts: Model.Contact[], options: BudgetPdf.Options) => {
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
                type: "text",
                width: "10%",
                cellProps: { style: { borderRightWidth: 1 }, textStyle: { textAlign: "center" } }
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
                    field: "contact",
                    headerName: "Contact",
                    type: "contact",
                    width: "10%",
                    cellRenderer: (
                      params: Table.PdfCellCallbackParams<BudgetPdf.SubAccountRow, Model.PdfSubAccount>
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
                    type: "number",
                    width: "10%"
                  },
                  {
                    field: "unit",
                    headerName: "Unit",
                    type: "singleSelect",
                    width: "10%",
                    cellRenderer: (params: Table.PdfCellCallbackParams<BudgetPdf.SubAccountRow, Model.PdfSubAccount>) =>
                      params.rawValue !== null ? <Tag model={params.rawValue} /> : <span></span>
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

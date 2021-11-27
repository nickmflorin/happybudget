import { useMemo } from "react";
import { isNil, map, filter, find, includes } from "lodash";

import { ShowHide } from "components";
import { Document, View, Page, Tag, Text, NoDataPage } from "components/pdf";
import { AccountsTable as GenericAccountsTable, SubAccountsTable as GenericSubAccountsTable } from "components/tabling";
import { tabling, budgeting } from "lib";

import PageHeader from "./PageHeader";
import Notes from "./Notes";
import { AccountsTable, AccountTable } from "./Tables";

interface BudgetPdfProps {
  readonly budget: Model.PdfBudget;
  readonly contacts: Model.Contact[];
  readonly options: PdfBudgetTable.Options;
}

const AccountColumns = filter(
  GenericAccountsTable.Columns,
  (c: Table.PdfColumn<Tables.AccountRowData, Model.PdfAccount>) => c.includeInPdf !== false
) as Table.PdfColumn<Tables.AccountRowData, Model.PdfAccount>[];

const SubAccountColumns = filter(
  GenericSubAccountsTable.Columns,
  (c: Table.PdfColumn<Tables.SubAccountRowData, Model.PdfSubAccount>) => c.includeInPdf !== false
) as Table.PdfColumn<Tables.SubAccountRowData, Model.PdfSubAccount>[];

const BudgetPdf = ({ budget, contacts, options }: BudgetPdfProps): JSX.Element => {
  const accountColumns = useMemo<Table.PdfColumn<Tables.AccountRowData, Model.PdfAccount>[]>(() => {
    let columns = tabling.columns.normalizeColumns(AccountColumns, {
      estimated: {
        pdfFooterValueGetter: budgeting.businessLogic.estimatedValue(budget)
      },
      variance: {
        pdfFooterValueGetter: budgeting.businessLogic.varianceValue(budget)
      },
      actual: {
        pdfFooterValueGetter: budgeting.businessLogic.actualValue(budget)
      }
    });
    columns = tabling.columns.normalizePdfColumnWidths(
      columns,
      (c: Table.PdfColumn<Tables.AccountRowData, Model.PdfAccount>) =>
        includes(options.columns, tabling.columns.normalizedField<Tables.AccountRowData, Model.PdfAccount>(c))
    );
    return tabling.columns.orderColumns(columns);
  }, []);

  const subaccountColumns = useMemo(() => {
    return (account: Model.PdfAccount): Table.PdfColumn<Tables.SubAccountRowData, Model.PdfSubAccount>[] => {
      type R = Tables.SubAccountRowData;
      type M = Model.PdfSubAccount;
      type C = Table.PdfColumn<R, M>;

      let columns = tabling.columns.normalizeColumns(SubAccountColumns, {
        description: {
          /* eslint-disable indent */
          pdfFooterValueGetter: !isNil(account.description)
            ? `${account.description} Total`
            : !isNil(account.identifier)
            ? `${account.identifier} Total`
            : "Total",
          pdfChildFooter: (m: M) => {
            if (!isNil(m.description)) {
              return { value: `${m.description} Total` };
            } else if (!isNil(m.identifier)) {
              return { value: `${m.identifier} Total` };
            }
            return { value: "Total" };
          }
        },
        contact: {
          pdfCellRenderer: (params: Table.PdfCellCallbackParams<R, M, number>) => {
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
            return <Text></Text>;
          }
        },
        unit: {
          pdfCellRenderer: (params: Table.PdfCellCallbackParams<R, M>) =>
            params.rawValue !== null ? <Tag model={params.rawValue} /> : <Text></Text>
        },
        estimated: {
          pdfFooterValueGetter: budgeting.businessLogic.estimatedValue(account),
          pdfChildFooter: (m: M) => {
            return { value: budgeting.businessLogic.estimatedValue(m) };
          }
        },
        variance: {
          pdfFooterValueGetter: budgeting.businessLogic.varianceValue(account),
          pdfChildFooter: (m: M) => {
            return { value: budgeting.businessLogic.varianceValue(m) };
          }
        },
        actual: {
          pdfFooterValueGetter: budgeting.businessLogic.actualValue(account),
          pdfChildFooter: (m: M) => {
            return { value: budgeting.businessLogic.actualValue(m) };
          }
        }
      });
      columns = tabling.columns.normalizePdfColumnWidths(columns, (c: C) =>
        includes(options.columns, tabling.columns.normalizedField<R, M>(c))
      );
      return tabling.columns.orderColumns<R, M>(columns);
    };
  }, []);

  const showTopSheet = useMemo(() => isNil(options.tables) || includes(options.tables, "topsheet"), [options]);

  const accounts = useMemo<Model.PdfAccount[]>(() => {
    return filter(
      budget.children,
      (account: Model.PdfAccount) =>
        (!(options.excludeZeroTotals === true) || budgeting.businessLogic.estimatedValue(account) !== 0) &&
        (isNil(options.tables) || includes(options.tables, account.id)) &&
        filter(
          account.children,
          (subaccount: Model.PdfSubAccount) =>
            !(options.excludeZeroTotals === true) || budgeting.businessLogic.estimatedValue(subaccount) !== 0
        ).length !== 0
    );
  }, [budget, options]);

  const optionsIndicateShowAccountSheets = useMemo(
    () => isNil(options.tables) || !(options.tables.length === 1 && options.tables[0] === "topsheet"),
    [options]
  );
  const showAccountSheets = useMemo(
    () => optionsIndicateShowAccountSheets && accounts.length !== 0,
    [accounts, optionsIndicateShowAccountSheets]
  );

  return (
    <Document>
      <ShowHide show={showTopSheet === false && showAccountSheets === false}>
        <NoDataPage />
      </ShowHide>
      <ShowHide show={showTopSheet}>
        <Page
          header={<PageHeader header={options.header} />}
          footer={options.includeNotes === true ? <Notes nodes={options.notes || []} /> : null}
        >
          <AccountsTable
            data={filter(
              budget.children,
              (account: Model.PdfAccount) =>
                !(options.excludeZeroTotals === true) || budgeting.businessLogic.estimatedValue(account) !== 0
            )}
            markups={budget.children_markups}
            groups={budget.groups}
            columns={accountColumns}
          />
        </Page>
      </ShowHide>
      <ShowHide show={showAccountSheets}>
        <Page>
          {map(accounts, (account: Model.PdfAccount, index: number) => {
            return (
              <View key={index} style={index !== 0 ? { marginTop: 20 } : {}}>
                <AccountTable
                  account={account}
                  options={options}
                  columns={accountColumns}
                  subAccountColumns={subaccountColumns(account)}
                />
              </View>
            );
          })}
        </Page>
      </ShowHide>
    </Document>
  );
};

export default BudgetPdf;

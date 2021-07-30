import { useMemo } from "react";
import { isNil, map, filter, find, includes } from "lodash";

import { ShowHide } from "components";
import { Document, View, Page, Tag, NoDataPage } from "components/pdf";
import { orderColumns } from "lib/model/util";

import { AccountColumns, SubAccountColumns } from "./config";
import PageHeader from "./PageHeader";
import Notes from "./Notes";
import { AccountsTable, AccountTable } from "./Tables";

interface BudgetPdfProps {
  readonly budget: Model.PdfBudget;
  readonly contacts: Model.Contact[];
  readonly options: PdfBudgetTable.Options;
}

const BudgetPdf = ({ budget, contacts, options }: BudgetPdfProps): JSX.Element => {
  const accountColumns = useMemo<PdfTable.Column<PdfBudgetTable.AccountRow, Model.PdfAccount>[]>(() => {
    const columnsObj = {
      ...AccountColumns,
      estimated: {
        ...AccountColumns.estimated,
        footer: {
          value: !isNil(budget.estimated) ? budget.estimated : 0.0
        }
      }
    };
    return orderColumns<
      PdfTable.Column<PdfBudgetTable.AccountRow, Model.PdfAccount>,
      PdfBudgetTable.AccountRow,
      Model.PdfAccount
    >(map(columnsObj, (c: PdfTable.Column<PdfBudgetTable.AccountRow, Model.PdfAccount>) => c));
  }, []);

  const subaccountColumns = useMemo(() => {
    return (account: Model.PdfAccount): PdfTable.Column<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>[] => {
      const columnsObj = {
        ...SubAccountColumns,
        description: {
          ...SubAccountColumns.description,
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
        contact: {
          ...SubAccountColumns.contact,
          cellRenderer: (params: PdfTable.CellCallbackParams<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>) => {
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
        unit: {
          ...SubAccountColumns.unit,
          cellRenderer: (params: PdfTable.CellCallbackParams<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>) =>
            params.rawValue !== null ? <Tag model={params.rawValue} /> : <span></span>
        },
        estimated: {
          ...SubAccountColumns.estimated,
          footer: {
            value: !isNil(account.estimated) ? account.estimated : 0.0
          },
          childFooter: (model: Model.PdfSubAccount) => {
            return { value: !isNil(model.estimated) ? model.estimated : 0.0 };
          }
        }
      };
      const ordered = orderColumns<
        PdfTable.Column<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>,
        PdfBudgetTable.SubAccountRow,
        Model.PdfSubAccount
      >(map(columnsObj, (c: PdfTable.Column<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>) => c));
      return filter(ordered, (column: PdfTable.Column<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>) =>
        includes(options.columns, column.field as string)
      );
    };
  }, []);

  const showTopSheet = useMemo(() => isNil(options.tables) || includes(options.tables, "topsheet"), [options]);

  const accounts = useMemo<Model.PdfAccount[]>(() => {
    return filter(
      budget.accounts,
      (account: Model.PdfAccount) =>
        (!(options.excludeZeroTotals === true) || account.estimated !== 0) &&
        (isNil(options.tables) || includes(options.tables, account.id)) &&
        filter(
          account.subaccounts,
          (subaccount: Model.PdfSubAccount) => !(options.excludeZeroTotals === true) || subaccount.estimated !== 0
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
          header={<PageHeader options={options} />}
          footer={options.includeNotes === true ? <Notes blocks={options.notes} /> : null}
        >
          <AccountsTable
            options={options}
            data={filter(
              budget.accounts,
              (account: Model.PdfAccount) => !(options.excludeZeroTotals === true) || account.estimated !== 0
            )}
            groups={budget.groups}
            columns={accountColumns}
          />
        </Page>
      </ShowHide>
      <ShowHide show={showAccountSheets}>
        <Page>
          {map(accounts, (account: Model.PdfAccount, index: number) => (
            <View key={index} style={index !== 0 ? { marginTop: 20 } : {}}>
              <AccountTable account={account} options={options} columns={subaccountColumns(account)} />
            </View>
          ))}
        </Page>
      </ShowHide>
    </Document>
  );
};

export default BudgetPdf;

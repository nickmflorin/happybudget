import { useMemo } from "react";
import { isNil, map, filter, find, includes, reduce } from "lodash";

import { ShowHide } from "components";
import { Document, View, Page, Tag, NoDataPage } from "components/pdf";
import { tabling } from "lib";

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
  const accountColumns = useMemo<PdfTable.Column<Tables.PdfAccountRow, Model.PdfAccount>[]>(() => {
    const columnsObj = {
      ...AccountColumns,
      estimated: {
        ...AccountColumns.estimated,
        footer: {
          value: !isNil(budget.estimated) ? budget.estimated : 0.0
        }
      }
    };
    return tabling.util.orderColumns<
      PdfTable.Column<Tables.PdfAccountRow, Model.PdfAccount>,
      Tables.PdfAccountRow,
      Model.PdfAccount
    >(map(columnsObj, (c: PdfTable.Column<Tables.PdfAccountRow, Model.PdfAccount>) => c));
  }, []);

  const subaccountColumns = useMemo(() => {
    return (account: Model.PdfAccount): PdfTable.Column<Tables.PdfSubAccountRow, Model.PdfSubAccount>[] => {
      // Add in properties to each column that depend on props and table state - properties
      // that cannot be added yet in the config file.
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
          cellRenderer: (params: PdfTable.CellCallbackParams<Tables.PdfSubAccountRow, Model.PdfSubAccount>) => {
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
          cellRenderer: (params: PdfTable.CellCallbackParams<Tables.PdfSubAccountRow, Model.PdfSubAccount>) =>
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
      // Map Columns Obj to Array
      let columns: PdfTable.Column<Tables.PdfSubAccountRow, Model.PdfSubAccount>[] = map(
        columnsObj,
        (c: PdfTable.Column<Tables.PdfSubAccountRow, Model.PdfSubAccount>) => c
      );
      // Calculate Total Column Width Before Filtering Out Unused Columns
      const totalWidth = reduce(
        columns,
        (prev: number, column: PdfTable.Column<Tables.PdfSubAccountRow, Model.PdfSubAccount>) => prev + column.width,
        0.0
      );
      if (totalWidth !== 0.0) {
        // Normalize Column Widths Before Filtering Out Unused Columns
        columns = map(columns, (column: PdfTable.Column<Tables.PdfSubAccountRow, Model.PdfSubAccount>) => ({
          ...column,
          width: column.width / totalWidth
        }));
        // Filter Out Unused Columns
        columns = filter(columns, (column: PdfTable.Column<Tables.PdfSubAccountRow, Model.PdfSubAccount>) =>
          includes(options.columns, column.field as string)
        );
        // Calculate Total Column Width After Filtering Out Unused Columns
        const totalWidthWithFilter = reduce(
          columns,
          (prev: number, column: PdfTable.Column<Tables.PdfSubAccountRow, Model.PdfSubAccount>) => prev + column.width,
          0.0
        );
        if (totalWidthWithFilter !== 0.0) {
          // Normalize Column Widths After Filtering Out Unused Columns
          columns = map(columns, (column: PdfTable.Column<Tables.PdfSubAccountRow, Model.PdfSubAccount>) => ({
            ...column,
            width: column.width / totalWidthWithFilter
          }));
        }
      }
      // Order the Columns
      return tabling.util.orderColumns<
        PdfTable.Column<Tables.PdfSubAccountRow, Model.PdfSubAccount>,
        Tables.PdfSubAccountRow,
        Model.PdfSubAccount
      >(columns);
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
          header={<PageHeader header={options.header} />}
          footer={options.includeNotes === true ? <Notes blocks={options.notes} /> : null}
        >
          <AccountsTable
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

import { useMemo } from "react";
import { isNil, map, filter, find, includes, reduce } from "lodash";

import { ShowHide } from "components";
import { Document, View, Page, Tag, NoDataPage } from "components/pdf";
import { tabling, model } from "lib";

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
  const accountColumns = useMemo<Table.PdfColumn<Tables.PdfAccountRowData, Model.PdfAccount>[]>(() => {
    const columns = tabling.columns.mergeColumns<
      Table.PdfColumn<Tables.PdfAccountRowData, Model.PdfAccount>,
      Tables.PdfAccountRowData,
      Model.PdfAccount
    >(AccountColumns, {
      estimated: (col: Table.PdfColumn<Tables.PdfAccountRowData, Model.PdfAccount>) => ({
        ...col,
        footer: {
          value: model.businessLogic.estimatedValue(budget)
        }
      })
    });
    return tabling.columns.orderColumns<
      Table.PdfColumn<Tables.PdfAccountRowData, Model.PdfAccount>,
      Tables.PdfAccountRowData,
      Model.PdfAccount
    >(columns);
  }, []);

  const subaccountColumns = useMemo(() => {
    return (account: Model.PdfAccount): Table.PdfColumn<Tables.PdfSubAccountRowData, Model.PdfSubAccount>[] => {
      type R = Tables.PdfSubAccountRowData;
      type M = Model.PdfSubAccount;
      type C = Table.PdfColumn<R, M>;

      let columns = tabling.columns.mergeColumns<C, R, M>(SubAccountColumns, {
        description: (col: C) => ({
          ...col,
          footer: {
            /* eslint-disable indent */
            value: !isNil(account.description)
              ? `${account.description} Total`
              : !isNil(account.identifier)
              ? `${account.identifier} Total`
              : "Total"
          },
          childFooter: (m: M) => {
            if (!isNil(m.description)) {
              return { value: `${m.description} Total` };
            } else if (!isNil(m.identifier)) {
              return { value: `${m.identifier} Total` };
            }
            return { value: "Total" };
          }
        }),
        contact: (col: C) => ({
          ...col,
          cellRenderer: (params: Table.PdfCellCallbackParams<R, M>) => {
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
        }),
        unit: (col: C) => ({
          ...col,
          cellRenderer: (params: Table.PdfCellCallbackParams<R, M>) =>
            params.rawValue !== null ? <Tag model={params.rawValue} /> : <span></span>
        }),
        estimated: (col: C) => ({
          ...col,
          footer: {
            value: model.businessLogic.estimatedValue(account)
          },
          childFooter: (m: M) => {
            return { value: model.businessLogic.estimatedValue(m) };
          }
        })
      });

      // Determine the default width for columns that do not specify it.
      const totalSpecifiedWidth = reduce(columns, (prev: number, column: C) => prev + (column.width || 0.0), 0.0);

      // Determine what the default width should be for columns that do not specify it.
      let defaultWidth = 0;
      if (totalSpecifiedWidth < 1.0) {
        defaultWidth = (1.0 - totalSpecifiedWidth) / filter(columns, (c: C) => !isNil(c.width)).length;
      }

      // Calculate Total Column Width Before Filtering Out Unused Columns
      const totalWidth = reduce(columns, (prev: number, column: C) => prev + (column.width || defaultWidth), 0.0);
      if (totalWidth !== 0.0) {
        // Normalize Column Widths Before Filtering Out Unused Columns
        columns = map(columns, (column: C) => ({
          ...column,
          width: (column.width || defaultWidth) / totalWidth
        }));
        // Filter Out Unused Columns
        columns = filter(columns, (column: C) => includes(options.columns, column.field as string));
        // Calculate Total Column Width After Filtering Out Unused Columns
        const totalWidthWithFilter = reduce(
          columns,
          (prev: number, column: C) => prev + (column.width || defaultWidth),
          0.0
        );
        if (totalWidthWithFilter !== 0.0) {
          // Normalize Column Widths After Filtering Out Unused Columns
          columns = map(columns, (column: C) => ({
            ...column,
            width: (column.width || defaultWidth) / totalWidthWithFilter
          }));
        }
      }
      // Order the Columns
      return tabling.columns.orderColumns<C, R, M>(columns);
    };
  }, []);

  const showTopSheet = useMemo(() => isNil(options.tables) || includes(options.tables, "topsheet"), [options]);

  const accounts = useMemo<Model.PdfAccount[]>(() => {
    return filter(
      budget.children,
      (account: Model.PdfAccount) =>
        (!(options.excludeZeroTotals === true) || model.businessLogic.estimatedValue(account) !== 0) &&
        (isNil(options.tables) || includes(options.tables, account.id)) &&
        filter(
          account.children,
          (subaccount: Model.PdfSubAccount) =>
            !(options.excludeZeroTotals === true) || model.businessLogic.estimatedValue(subaccount) !== 0
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
              budget.children,
              (account: Model.PdfAccount) =>
                !(options.excludeZeroTotals === true) || model.businessLogic.estimatedValue(account) !== 0
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
              <AccountTable
                account={account}
                options={options}
                columns={accountColumns}
                subAccountColumns={subaccountColumns(account)}
              />
            </View>
          ))}
        </Page>
      </ShowHide>
    </Document>
  );
};

export default BudgetPdf;

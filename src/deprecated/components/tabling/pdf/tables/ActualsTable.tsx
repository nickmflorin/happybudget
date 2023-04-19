import { useMemo } from "react";

import { includes, reduce, filter } from "lodash";

import { tabling, hooks } from "lib";

import Table from "./Table";
import { BodyRow, HeaderRow, FooterRow } from "../rows";

type M = Model.Actual;
type R = Tables.ActualRowData;
type C = Table.ModelColumn<R, M>;
type DC = Table.DataColumn<R, M>;

type ActualsTableProps = {
  readonly data: Model.Actual[];
  readonly columns: C[];
  readonly options: ExportPdfFormOptions;
};

const ActualsTable = ({ columns, data, options }: ActualsTableProps): JSX.Element => {
  const columnIsVisible = useMemo(
    () => (c: DC) => includes(options.columns, c.field),
    [options.columns],
  );

  const generateRows = hooks.useDynamicCallback((): JSX.Element[] => {
    const rowData = tabling.rows.generateTableData<R, M>({
      response: { models: data },
      columns,
    });
    return [
      ...reduce(
        rowData,
        (rws: JSX.Element[], row: Table.BodyRow<R>) => {
          if (tabling.rows.isModelRow(row)) {
            return [
              ...rws,
              <BodyRow<R, M>
                key={`row-${row.id}`}
                columnIsVisible={columnIsVisible}
                columns={filter(columns, (c: C) => tabling.columns.isDataColumn(c)) as DC[]}
                row={row}
                data={rowData}
              />,
            ];
          }
          return rws;
        },
        [
          <HeaderRow<R, M>
            key="header-row"
            columnIsVisible={columnIsVisible}
            columns={filter(columns, (c: C) => tabling.columns.isDataColumn(c)) as DC[]}
          />,
        ],
      ),
      <FooterRow<R, M>
        key="footer-row"
        columnIsVisible={columnIsVisible}
        columns={filter(columns, (c: C) => tabling.columns.isDataColumn(c)) as DC[]}
        data={rowData}
      />,
    ];
  });

  return <Table generateRows={generateRows} />;
};

export default ActualsTable;

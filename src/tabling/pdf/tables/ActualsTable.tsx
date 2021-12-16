import { useMemo } from "react";
import { includes, reduce } from "lodash";

import { tabling, hooks } from "lib";
import { BodyRow, HeaderRow, FooterRow } from "../rows";
import Table from "./Table";

type M = Model.Actual;
type R = Tables.ActualRowData;

type ActualsTableProps = {
  readonly data: Model.Actual[];
  readonly columns: Table.PdfColumn<R, M>[];
  readonly options: ExportPdfFormOptions;
};

const ActualsTable = ({ columns, data, options }: ActualsTableProps): JSX.Element => {
  const columnIsVisible = useMemo(
    () => (c: Table.PdfColumn<Tables.ActualRowData, Model.Actual>) =>
      includes(options.columns, tabling.columns.normalizedField<Tables.ActualRowData, Model.Actual>(c)),
    [options.columns]
  );

  const generateRows = hooks.useDynamicCallback((): JSX.Element[] => {
    const rowData = tabling.data.createTableRows<R, M>({
      response: { models: data },
      columns
    });
    return [
      ...reduce(
        rowData,
        (rws: JSX.Element[], row: Table.BodyRow<R>) => {
          if (tabling.typeguards.isModelRow(row)) {
            return [...rws, <BodyRow columnIsVisible={columnIsVisible} columns={columns} row={row} data={rowData} />];
          }
          return rws;
        },
        [<HeaderRow columnIsVisible={columnIsVisible} columns={columns} />]
      ),
      <FooterRow columnIsVisible={columnIsVisible} columns={columns} data={rowData} />
    ];
  });

  return <Table generateRows={generateRows} />;
};

export default ActualsTable;
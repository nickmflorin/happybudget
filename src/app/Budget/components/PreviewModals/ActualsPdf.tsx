import { useMemo } from "react";
import { isNil, filter, find, includes } from "lodash";

import { Document, Page, Tag, Text, View } from "components/pdf";
import { ActualsTable as GenericActualsTable } from "components/tabling";
import { ActualsTable } from "components/tabling/pdf";

import { tabling } from "lib";

type R = Tables.ActualRowData;
type M = Model.Actual;
type C = Table.PdfColumn<R, M>;

interface ActualsPdfProps {
  readonly budget: Model.Budget;
  readonly actuals: Model.Actual[];
  readonly contacts: Model.Contact[];
  readonly options: ExportPdfFormOptions;
}

const ActualColumns = filter(GenericActualsTable.Columns, (c: C) => c.includeInPdf !== false) as C[];

const ActualsPdf = ({ budget, actuals, contacts, options }: ActualsPdfProps): JSX.Element => {
  const actualColumns = useMemo(() => {
    let columns = tabling.columns.normalizeColumns(ActualColumns, {
      description: {
        pdfFooterValueGetter: `${budget.name} Total`
      },
      contact: {
        pdfCellRenderer: (params: Table.PdfCellCallbackParams<R, M, number>) => {
          if (params.rawValue !== null) {
            const contact: Model.Contact | undefined = find(contacts, { id: params.rawValue });
            if (!isNil(contact)) {
              return (
                <Tag className={"tag tag--contact"} color={"#EFEFEF"} textColor={"#2182e4"} text={contact.full_name} />
              );
            }
          }
          return <Text></Text>;
        }
      },
      actual_type: {
        pdfCellRenderer: (params: Table.PdfCellCallbackParams<R, M>) =>
          params.rawValue !== null ? <Tag model={params.rawValue} /> : <Text></Text>
      }
    });
    columns = tabling.columns.normalizePdfColumnWidths(columns, (c: C) =>
      includes(options.columns, tabling.columns.normalizedField<R, M>(c))
    );
    return tabling.columns.orderColumns<R, M>(columns);
  }, [contacts]);

  const filteredActuals = useMemo<Model.Actual[]>(() => {
    return filter(actuals, (actual: Model.Actual) => !(options.excludeZeroTotals === true) || actual.value !== 0);
  }, [budget, actuals, options]);

  return (
    <Document>
      <Page>
        <ActualsTable data={filteredActuals} columns={actualColumns} options={options} />
      </Page>
    </Document>
  );
};

export default ActualsPdf;

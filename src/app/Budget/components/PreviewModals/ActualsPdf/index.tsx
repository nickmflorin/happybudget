import { useMemo } from "react";
import { isNil, filter, find, includes } from "lodash";

import { tabling } from "lib";
import { Colors } from "style/constants";

import { Document, Page, Tag, Text } from "components/pdf";
import { ActualsTable as GenericActualsTable } from "tabling";
import { ActualsTable } from "tabling/pdf";

import PageHeader from "./PageHeader";

type R = Tables.ActualRowData;
type M = Model.Actual;
type C = Table.Column<R, M>;

interface ActualsPdfProps {
  readonly budget: Model.Budget;
  readonly actuals: Model.Actual[];
  readonly contacts: Model.Contact[];
  readonly options: ExportPdfFormOptions;
}

const ActualColumns = filter(GenericActualsTable.Columns, (c: C) => c.includeInPdf !== false) as C[];

const ActualsPdf = ({ budget, actuals, contacts, options }: ActualsPdfProps): JSX.Element => {
  const actualColumns = useMemo(() => {
    let columns = tabling.columns.normalizeColumns<R, M>(ActualColumns, {
      description: {
        pdfFooterValueGetter: `${budget.name} Total`
      },
      contact: {
        pdfCellRenderer: (params: Table.PdfCellCallbackParams<R, M, number>) => {
          if (params.rawValue !== null) {
            const contact: Model.Contact | undefined = find(contacts, { id: params.rawValue });
            if (!isNil(contact)) {
              return (
                <Tag
                  fillWidth={false}
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
      owner: {
        pdfCellRenderer: (params: Table.PdfCellCallbackParams<R, M, Model.ActualOwner>) => {
          if (params.rawValue !== null) {
            return (
              <Tag
                className={"tag--account"}
                textColor={Colors.TEXT_SECONDARY}
                color={null}
                fillWidth={false}
                text={params.rawValue.description || params.rawValue.identifier}
              />
            );
          }
          return <Text></Text>;
        }
      },
      actual_type: {
        pdfCellRenderer: (params: Table.PdfCellCallbackParams<R, M, Model.Tag | null>) =>
          params.rawValue !== null ? <Tag fillWidth={false} model={params.rawValue} /> : <Text></Text>
      }
    });
    columns = tabling.columns.normalizePdfColumnWidths<R, M, C>(columns, (c: C) =>
      includes(options.columns, tabling.columns.normalizedField<R, M>(c))
    );
    return tabling.columns.orderColumns<R, M>(columns);
  }, [contacts]);

  const filteredActuals = useMemo<Model.Actual[]>(() => {
    return filter(actuals, (actual: Model.Actual) => !(options.excludeZeroTotals === true) || actual.value !== 0);
  }, [budget, actuals, options]);

  return (
    <Document>
      <Page header={<PageHeader header={budget.name} />}>
        <ActualsTable data={filteredActuals} columns={actualColumns} options={options} />
      </Page>
    </Document>
  );
};

export default ActualsPdf;

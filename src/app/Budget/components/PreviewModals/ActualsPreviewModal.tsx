import { useEffect, useState, useRef, useMemo } from "react";
import { isNil, map, filter } from "lodash";
import classNames from "classnames";

import * as api from "api";
import { ui, tabling, pdf, util, contacts } from "lib";

import { ExportActualsPdfForm } from "components/forms";
import { PreviewModal } from "components/modals";
import { ActualsTable } from "tabling";

import ActualsPdf from "./ActualsPdf";

type M = Model.Actual;
type R = Tables.ActualRowData;
type C = Table.DataColumn<R, M>;

const ActualColumns = filter(
  ActualsTable.Columns,
  (c: Table.Column<R, M>) => tabling.typeguards.isDataColumn(c) && c.includeInPdf !== false
) as C[];

const DEFAULT_OPTIONS: ExportActualsPdfFormOptions = {
  excludeZeroTotals: false,
  date: util.dates.toDisplayDate() as string,
  columns: filter(
    map(ActualColumns, (column: C) => tabling.columns.normalizedField<R, M>(column)),
    (field: string | undefined) => !isNil(field)
  ) as string[],
  header: `<h2>Sample Title ${new Date().getFullYear()}</h2><p>Sample Subtitle</p>`
};

interface ActualsPdfFuncProps {
  readonly actuals: M[];
  readonly contacts: Model.Contact[];
  readonly options: PdfActualsTable.Options;
  readonly budget: Model.Budget;
}

const ActualsPdfFunc = (props: ActualsPdfFuncProps): JSX.Element => <ActualsPdf {...props} />;

interface ActualsPreviewModalProps extends ModalProps {
  readonly filename: string;
  readonly budgetId: number;
  readonly initiallyRender?: boolean;
  readonly budget: Model.Budget;
  readonly onSuccess?: () => void;
}

const ActualsPreviewModal = ({
  budget,
  budgetId,
  filename,
  initiallyRender,
  onSuccess,
  ...props
}: ActualsPreviewModalProps): JSX.Element => {
  const previewer = useRef<Pdf.IPreviewerRef>(null);
  const [getToken] = api.useCancelToken({ preserve: true, createOnInit: true });

  const cs = contacts.hooks.useContacts();

  const [options, setOptions] = useState<ExportActualsPdfFormOptions>(DEFAULT_OPTIONS);
  const [actuals, setActuals] = useState<M[] | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const form = ui.hooks.useForm<ExportActualsPdfFormOptions>({ isInModal: true });
  const modal = ui.hooks.useModal();

  const convertOptions = useMemo(
    () =>
      (opts: ExportActualsPdfFormOptions): PdfActualsTable.Options => ({
        ...opts,
        header: pdf.parsers.convertHtmlIntoNodes(opts.header || "") || []
      }),
    []
  );

  useEffect(() => {
    setOptions({
      ...DEFAULT_OPTIONS,
      header: `<h2>${budget.name}</h2><p>Actuals Summary</p>`
    });
  }, [budget.name]);

  useEffect(() => {
    if (props.open === true) {
      api
        .getActuals(budgetId, {}, { cancelToken: getToken() })
        .then((response: Http.ListResponse<M>) => {
          setActuals(response.data);
          /* Since @react-pdf blocks the entire UI thread (which is ridiculous),
						 this is usually not desirable as rendering large PDF's once the
						 modal is open will prevent the form from being edited until the
						 PDF finishes rendering. */
          if (initiallyRender === true) {
            const pdfComponent = ActualsPdfFunc({
              budget,
              contacts: cs,
              actuals: response.data,
              options: convertOptions(options)
            });
            previewer.current?.render(pdfComponent);
          } else {
            previewer.current?.renderEmptyDocument({ text: false });
            previewer.current?.refreshRequired();
          }
        })
        .catch((e: Error) => modal.current.handleRequestError(e))
        .finally(() => setLoadingData(false));
    }
  }, [props.open]);

  const renderComponent = useMemo(
    () => () => {
      if (!isNil(actuals)) {
        return ActualsPdfFunc({
          budget,
          contacts: cs,
          actuals,
          options: convertOptions(options)
        });
      }
    },
    [budget, contacts, actuals, options]
  );

  return (
    <PreviewModal
      {...props}
      modal={modal}
      previewer={previewer}
      loadingData={loadingData}
      renderComponent={renderComponent}
      filename={filename}
      onExportSuccess={onSuccess}
      className={classNames("actuals-preview-modal", props.className)}
    >
      <ExportActualsPdfForm
        form={form}
        initialValues={{
          ...DEFAULT_OPTIONS,
          header: `<h2>${budget.name}</h2><p>Actuals Summary</p>`
        }}
        disabled={isNil(actuals)}
        columns={ActualColumns}
        onValuesChange={(changedValues: Partial<ExportActualsPdfFormOptions>, values: ExportActualsPdfFormOptions) => {
          setOptions(values);
          previewer.current?.refreshRequired();
        }}
      />
    </PreviewModal>
  );
};

export default ActualsPreviewModal;

import { useEffect, useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { isNil, map, filter } from "lodash";

import * as api from "api";
import { ui, tabling, notifications } from "lib";

import { selectors } from "store";

import { ExportActualsPdfForm } from "components/forms";
import { PreviewModal } from "components/modals";
import { ActualsTable } from "tabling";

import ActualsPdf from "./ActualsPdf";
import "./ActualsPreviewModal.scss";

type M = Model.Actual;
type R = Tables.ActualRowData;

const ActualColumns = filter(
  ActualsTable.Columns,
  (c: Table.PdfColumn<R, M>) => c.includeInPdf !== false
) as Table.PdfColumn<R, M>[];

const DEFAULT_OPTIONS: ExportPdfFormOptions = {
  excludeZeroTotals: false,
  columns: filter(
    map(ActualColumns, (column: Table.PdfColumn<R, M>) => tabling.columns.normalizedField<R, M>(column)),
    (field: string | undefined) => !isNil(field)
  ) as string[]
};

interface ActualsPdfFuncProps {
  readonly actuals: M[];
  readonly contacts: Model.Contact[];
  readonly options: ExportPdfFormOptions;
  readonly budget: Model.Budget;
}

const ActualsPdfFunc = (props: ActualsPdfFuncProps): JSX.Element => <ActualsPdf {...props} />;

interface ActualsPreviewModalProps {
  readonly onSuccess?: () => void;
  readonly onCancel: () => void;
  readonly visible: boolean;
  readonly filename: string;
  readonly budgetId: number;
  readonly budget: Model.Budget;
}

const ActualsPreviewModal = ({
  budget,
  budgetId,
  visible,
  filename,
  onSuccess,
  onCancel
}: ActualsPreviewModalProps): JSX.Element => {
  const previewer = useRef<Pdf.IPreviewerRef>(null);
  const [getToken] = api.useCancelToken({ preserve: true, createOnInit: true });

  const contacts = useSelector(selectors.selectContacts);

  const [options, setOptions] = useState<ExportPdfFormOptions>(DEFAULT_OPTIONS);
  const [actuals, setActuals] = useState<M[] | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const form = ui.hooks.useForm<ExportPdfFormOptions>({ isInModal: true });

  useEffect(() => {
    if (visible === true) {
      api
        .getActuals(budgetId, {}, { cancelToken: getToken() })
        .then((response: Http.ListResponse<M>) => {
          setActuals(response.data);
          const pdfComponent = ActualsPdfFunc({
            budget,
            contacts,
            actuals: response.data,
            options
          });
          previewer.current?.render(pdfComponent);
        }) /* TODO: We should probably display the error in the modal and not let
							the default toast package display it in the top right of the
							window. */
        .catch((e: Error) => notifications.requestError(e))
        .finally(() => setLoadingData(false));
    }
  }, [visible]);

  const renderComponent = useMemo(
    () => () => {
      if (!isNil(actuals)) {
        return ActualsPdfFunc({
          budget,
          contacts,
          actuals,
          options
        });
      }
    },
    [budget, contacts, actuals, options]
  );

  return (
    <PreviewModal
      visible={visible}
      onCancel={onCancel}
      previewer={previewer}
      loadingData={loadingData}
      renderComponent={renderComponent}
      filename={filename}
      onExportSuccess={onSuccess}
      className={"actuals-preview-modal"}
    >
      <ExportActualsPdfForm
        form={form}
        initialValues={DEFAULT_OPTIONS}
        actuals={actuals || []}
        actualsLoading={loadingData}
        disabled={isNil(actuals)}
        columns={ActualColumns}
        onValuesChange={(changedValues: Partial<ExportPdfFormOptions>, values: ExportPdfFormOptions) => {
          setOptions(values);
          previewer.current?.refreshRequired();
        }}
      />
    </PreviewModal>
  );
};

export default ActualsPreviewModal;

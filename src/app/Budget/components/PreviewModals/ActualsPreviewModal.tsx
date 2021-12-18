import { useEffect, useState, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import { isNil, map, filter } from "lodash";
import classNames from "classnames";

import * as api from "api";
import { ui, tabling } from "lib";

import { selectors } from "store";

import { ExportActualsPdfForm } from "components/forms";
import { PreviewModal } from "components/modals";
import { ActualsTable } from "tabling";

import ActualsPdf from "./ActualsPdf";

type M = Model.Actual;
type R = Tables.ActualRowData;
type C = Table.Column<R, M>;

const ActualColumns = filter(ActualsTable.Columns, (c: C) => c.includeInPdf !== false) as C[];

const DEFAULT_OPTIONS: ExportPdfFormOptions = {
  excludeZeroTotals: false,
  columns: filter(
    map(ActualColumns, (column: C) => tabling.columns.normalizedField<R, M>(column)),
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

interface ActualsPreviewModalProps extends ModalProps {
  readonly onSuccess?: () => void;
  readonly filename: string;
  readonly budgetId: number;
  readonly budget: Model.Budget;
}

const ActualsPreviewModal = ({
  budget,
  budgetId,
  filename,
  onSuccess,
  ...props
}: ActualsPreviewModalProps): JSX.Element => {
  const previewer = useRef<Pdf.IPreviewerRef>(null);
  const [getToken] = api.useCancelToken({ preserve: true, createOnInit: true });

  const contacts = useSelector(selectors.selectContacts);

  const [options, setOptions] = useState<ExportPdfFormOptions>(DEFAULT_OPTIONS);
  const [actuals, setActuals] = useState<M[] | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const form = ui.hooks.useForm<ExportPdfFormOptions>({ isInModal: true });
  const modal = ui.hooks.useModal();

  useEffect(() => {
    if (props.open === true) {
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
        .catch((e: Error) => modal.current.handleRequestError(e))
        .finally(() => setLoadingData(false));
    }
  }, [props.open]);

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
        initialValues={DEFAULT_OPTIONS}
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

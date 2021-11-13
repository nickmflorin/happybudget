import { useEffect, useState, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { isNil, map, filter } from "lodash";
import classNames from "classnames";

import * as api from "api";
import { redux, ui, tabling, pdf, contacts } from "lib";

import { ExportBudgetPdfForm } from "components/forms";
import { PreviewModal } from "components/modals";
import { SubAccountsTable } from "tabling";

import { actions } from "../../store";
import BudgetPdf from "./BudgetPdf";

import "./BudgetPreviewModal.scss";

type R = Tables.SubAccountRowData;
type M = Model.PdfSubAccount;
type C = Table.DataColumn<R, M>;

const SubAccountColumns = filter(
  SubAccountsTable.Columns,
  (c: Table.Column<R, M>) => tabling.typeguards.isDataColumn(c) && c.includeInPdf !== false
) as C[];

const DEFAULT_OPTIONS: ExportBudgetPdfFormOptions = {
  excludeZeroTotals: false,
  header: {
    header: `<h2>Sample Budget ${new Date().getFullYear()}</h2><p>Cost Summary</p>`,
    left_image: null,
    right_image: null,
    left_info: "<h6>Production Company</h6><p>Address:</p><p>Phone:</p>",
    right_info: "<h6>Client / Agency</h6><p>Address:</p><p>Phone:</p>"
  },
  includeNotes: false,
  columns: filter(
    map(SubAccountColumns, (column: C) => tabling.columns.normalizedField<R, M>(column)),
    (field: string | undefined) => !isNil(field)
  ) as string[]
};

interface BudgetPdfFuncProps {
  readonly budget: Model.PdfBudget;
  readonly contacts: Model.Contact[];
  readonly options: PdfBudgetTable.Options;
}

const BudgetPdfFunc = (props: BudgetPdfFuncProps): JSX.Element => <BudgetPdf {...props} />;

interface PreviewModalProps extends ModalProps {
  readonly onSuccess?: () => void;
  readonly budgetId: number;
  readonly budgetName: string;
  readonly filename: string;
}

const selectHeaderTemplatesLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Application.AuthenticatedStore) => state.budget.headerTemplates.loading
);
const selectHeaderTemplates = redux.selectors.simpleDeepEqualSelector(
  (state: Application.AuthenticatedStore) => state.budget.headerTemplates.data
);
const selectDisplayedHeaderTemplate = redux.selectors.simpleDeepEqualSelector(
  (state: Application.AuthenticatedStore) => state.budget.headerTemplates.displayedTemplate
);
const selectHeaderTemplateLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Application.AuthenticatedStore) => state.budget.headerTemplates.loadingDetail
);

const BudgetPreviewModal = ({
  budgetId,
  budgetName,
  filename,
  onSuccess,
  ...props
}: PreviewModalProps): JSX.Element => {
  const previewer = useRef<Pdf.IPreviewerRef>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [getToken] = api.useCancelToken({ preserve: true, createOnInit: true });

  const cs = contacts.hooks.useContacts();

  const [budget, setBudget] = useState<Model.PdfBudget | null>(null);
  const [options, setOptions] = useState<ExportBudgetPdfFormOptions>(DEFAULT_OPTIONS);

  const form = ui.hooks.useForm<ExportBudgetPdfFormOptions>({ isInModal: true });
  const modal = ui.hooks.useModal();
  const dispatch = useDispatch();

  const headerTemplatesLoading = useSelector(selectHeaderTemplatesLoading);
  const headerTemplates = useSelector(selectHeaderTemplates);
  const displayedHeaderTemplate = useSelector(selectDisplayedHeaderTemplate);
  const headerTemplateLoading = useSelector(selectHeaderTemplateLoading);

  const convertOptions = useMemo(
    () =>
      (opts: ExportBudgetPdfFormOptions): PdfBudgetTable.Options => ({
        ...opts,
        notes: pdf.parsers.convertHtmlIntoNodes(opts.notes || "") || [],
        header: {
          ...opts.header,
          header: pdf.parsers.convertHtmlIntoNodes(opts.header.header || "") || [],
          left_info: pdf.parsers.convertHtmlIntoNodes(opts.header.left_info || "") || [],
          right_info: pdf.parsers.convertHtmlIntoNodes(opts.header.right_info || "") || []
        }
      }),
    []
  );

  useEffect(() => {
    setOptions({
      ...DEFAULT_OPTIONS,
      header: {
        ...DEFAULT_OPTIONS.header,
        header: `<h2>${budgetName}</h2><p>Cost Summary</p>`
      }
    });
  }, [budgetName]);

  useEffect(() => {
    if (props.open === true) {
      dispatch(actions.pdf.requestHeaderTemplatesAction(null));
      api
        .getBudgetPdf(budgetId, { cancelToken: getToken() })
        .then((response: Model.PdfBudget) => {
          setBudget(response);
          const pdfComponent = BudgetPdfFunc({
            budget: response,
            contacts: cs,
            options: convertOptions(options)
          });
          previewer.current?.render(pdfComponent);
        })
        .catch((e: Error) => modal.current.handleRequestError(e))
        .finally(() => setLoadingData(false));
    }
  }, [props.open]);

  const renderComponent = useMemo(
    () => () => {
      if (!isNil(budget)) {
        return BudgetPdfFunc({
          budget,
          contacts: cs,
          options: convertOptions(options)
        });
      }
    },
    [budget, contacts, options]
  );

  return (
    <PreviewModal
      {...props}
      previewer={previewer}
      loadingData={loadingData}
      renderComponent={renderComponent}
      filename={filename}
      modal={modal}
      onExportSuccess={onSuccess}
      className={classNames("budget-preview-modal", props.className)}
    >
      <ExportBudgetPdfForm
        form={form}
        initialValues={{
          ...DEFAULT_OPTIONS,
          header: {
            ...DEFAULT_OPTIONS.header,
            header: `<h2>${budgetName}</h2><p>Cost Summary</p>`
          }
        }}
        loading={headerTemplateLoading}
        headerTemplates={headerTemplates}
        headerTemplatesLoading={headerTemplatesLoading}
        accountsLoading={loadingData}
        accounts={!isNil(budget) ? budget.children : []}
        columns={SubAccountColumns}
        onValuesChange={(changedValues: Partial<ExportBudgetPdfFormOptions>, values: ExportBudgetPdfFormOptions) => {
          setOptions(values);
          previewer.current?.refreshRequired();
        }}
        displayedHeaderTemplate={displayedHeaderTemplate}
        onClearHeaderTemplate={() => dispatch(actions.pdf.clearHeaderTemplateAction(null))}
        onLoadHeaderTemplate={(id: number) => dispatch(actions.pdf.loadHeaderTemplateAction(id))}
        onHeaderTemplateDeleted={(id: number) => {
          if (!isNil(displayedHeaderTemplate) && displayedHeaderTemplate.id === id) {
            dispatch(actions.pdf.clearHeaderTemplateAction(null));
          }
          dispatch(actions.pdf.removeHeaderTemplateFromStateAction(id));
        }}
        onHeaderTemplateCreated={(template: Model.HeaderTemplate) => {
          dispatch(actions.pdf.addHeaderTemplateToStateAction(template));
          dispatch(actions.pdf.displayHeaderTemplateAction(template));
        }}
      />
    </PreviewModal>
  );
};

export default BudgetPreviewModal;

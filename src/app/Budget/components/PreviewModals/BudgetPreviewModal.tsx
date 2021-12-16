import { useEffect, useState, useRef, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { isNil, map, filter } from "lodash";

import * as api from "api";
import { redux, ui, tabling, notifications, pdf } from "lib";
import { selectors } from "store";

import { ExportBudgetPdfForm } from "components/forms";
import { PreviewModal } from "components/modals";
import { SubAccountsTable } from "tabling";

import { actions } from "../../store";
import BudgetPdf from "./BudgetPdf";

import "./BudgetPreviewModal.scss";

const SubAccountColumns = filter(
  SubAccountsTable.Columns,
  (c: Table.PdfColumn<Tables.SubAccountRowData, Model.PdfSubAccount>) => c.includeInPdf !== false
) as Table.PdfColumn<Tables.SubAccountRowData, Model.PdfSubAccount>[];

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
    map(SubAccountColumns, (column: Table.PdfColumn<Tables.SubAccountRowData, Model.PdfSubAccount>) =>
      tabling.columns.normalizedField<Tables.SubAccountRowData, Model.PdfSubAccount>(column)
    ),
    (field: string | undefined) => !isNil(field)
  ) as string[]
};

interface BudgetPdfFuncProps {
  readonly budget: Model.PdfBudget;
  readonly contacts: Model.Contact[];
  readonly options: PdfBudgetTable.Options;
}

const BudgetPdfFunc = (props: BudgetPdfFuncProps): JSX.Element => <BudgetPdf {...props} />;

interface PreviewModalProps {
  readonly onSuccess?: () => void;
  readonly onCancel: () => void;
  readonly visible: boolean;
  readonly budgetId: number;
  readonly budgetName: string;
  readonly filename: string;
}

const selectHeaderTemplatesLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.headerTemplates.loading
);
const selectHeaderTemplates = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.headerTemplates.data
);
const selectDisplayedHeaderTemplate = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.headerTemplates.displayedTemplate
);
const selectHeaderTemplateLoading = redux.selectors.simpleShallowEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.headerTemplates.loadingDetail
);

const BudgetPreviewModal = ({
  budgetId,
  budgetName,
  visible,
  filename,
  onSuccess,
  onCancel
}: PreviewModalProps): JSX.Element => {
  const previewer = useRef<Pdf.IPreviewerRef>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [getToken] = api.useCancelToken({ preserve: true, createOnInit: true });

  const contacts = useSelector(selectors.selectContacts);

  const [budget, setBudget] = useState<Model.PdfBudget | null>(null);
  const [options, setOptions] = useState<ExportBudgetPdfFormOptions>(DEFAULT_OPTIONS);

  const form = ui.hooks.useForm<ExportBudgetPdfFormOptions>({ isInModal: true });
  const dispatch = useDispatch();

  const headerTemplatesLoading = useSelector(selectHeaderTemplatesLoading);
  const headerTemplates = useSelector(selectHeaderTemplates);
  const displayedHeaderTemplate = useSelector(selectDisplayedHeaderTemplate);
  const headerTemplateLoading = useSelector(selectHeaderTemplateLoading);

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
    if (visible === true) {
      dispatch(actions.pdf.requestHeaderTemplatesAction(null));
      api
        .getBudgetPdf(budgetId, { cancelToken: getToken() })
        .then((response: Model.PdfBudget) => {
          setBudget(response);
          const pdfComponent = BudgetPdfFunc({
            budget: response,
            contacts,
            options: convertOptions(options)
          });
          previewer.current?.render(pdfComponent);
        })
        .catch((e: Error) => notifications.requestError(e))
        .finally(() => setLoadingData(false));
    }
  }, [visible]);

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

  const renderComponent = useMemo(
    () => () => {
      if (!isNil(budget)) {
        return BudgetPdfFunc({
          budget,
          contacts,
          options: convertOptions(options)
        });
      }
    },
    [budget, contacts, options]
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
      className={"budget-preview-modal"}
      onRenderError={(e: Error) => {
        console.error(e);
        toast.error("There was an error rendering the PDF.");
      }}
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
        disabled={isNil(budget)}
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
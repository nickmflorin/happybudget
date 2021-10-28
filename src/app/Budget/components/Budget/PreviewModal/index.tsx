import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { pdf as PDF } from "@react-pdf/renderer";
import { isNil, map, debounce, filter } from "lodash";

import * as api from "api";
import { registerFonts } from "style/pdf";
import { util, redux, ui, tabling, pdf, notifications } from "lib";

import { Modal } from "components";
import { ExportPdfForm } from "components/forms";
import { SubAccountsTable } from "components/tabling";

import { actions } from "../../../store";

import BudgetPdf from "../BudgetPdf";
import Previewer from "./Previewer";
import "./index.scss";

const BudgetPdfFunc = (budget: Model.PdfBudget, contacts: Model.Contact[], options: PdfBudgetTable.Options) => (
  <BudgetPdf budget={budget} contacts={contacts} options={options} />
);

const SubAccountColumns = filter(
  SubAccountsTable.Columns,
  (c: Table.PdfColumn<Tables.SubAccountRowData, Model.PdfSubAccount>) => c.includeInPdf !== false
) as Table.PdfColumn<Tables.SubAccountRowData, Model.PdfSubAccount>[];

const DEFAULT_OPTIONS: ExportFormOptions = {
  excludeZeroTotals: true,
  header: {
    header: `<h2>Sample Budget ${new Date().getFullYear()}</h2><p>Cost Summary</p>`,
    left_image: null,
    right_image: null,
    left_info: "<h4>Production Company</h4><p>Address:</p><p>Phone:</p>",
    right_info: "<h4>Client / Agency</h4><p>Address:</p><p>Phone:</p>"
  },
  includeNotes: false,
  columns: filter(
    map(SubAccountColumns, (column: Table.PdfColumn<Tables.SubAccountRowData, Model.PdfSubAccount>) =>
      tabling.columns.normalizedField(column)
    ),
    (field: string | undefined) => !isNil(field)
  ) as string[]
};

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

const PreviewModal = ({
  budgetId,
  budgetName,
  visible,
  filename,
  onSuccess,
  onCancel
}: PreviewModalProps): JSX.Element => {
  const [loadingData, setLoadingData] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [options, setOptions] = useState<ExportFormOptions>(DEFAULT_OPTIONS);

  // TODO: Should we just use the useContacts hook?
  const [contactsResponse, setContactsResponse] = useState<Http.ListResponse<Model.Contact> | null>(null);
  const [budgetResponse, setBudgetResponse] = useState<Model.PdfBudget | null>(null);

  const [file, setFile] = useState<string | ArrayBuffer | null>(null);
  const form = ui.hooks.useForm<ExportFormOptions>({ isInModal: true });
  const dispatch = useDispatch();

  const headerTemplatesLoading = useSelector(selectHeaderTemplatesLoading);
  const headerTemplates = useSelector(selectHeaderTemplates);
  const displayedHeaderTemplate = useSelector(selectDisplayedHeaderTemplate);
  const headerTemplateLoading = useSelector(selectHeaderTemplateLoading);

  useEffect(() => {
    if (visible === true) {
      dispatch(actions.pdf.requestHeaderTemplatesAction(null));
      registerFonts().then(() => {
        const promises: [Promise<Model.PdfBudget>, Promise<Http.ListResponse<Model.Contact>>] = [
          api.getBudgetPdf(budgetId),
          api.getContacts()
        ];
        setLoadingData(true);
        Promise.all(promises)
          .then(([b, cs]: [Model.PdfBudget, Http.ListResponse<Model.Contact>]) => {
            setContactsResponse(cs);
            setBudgetResponse(b);
          })
          // TODO: We should probably display the error in the modal and not let the default toast
          // package display it in the top right of the window.
          .catch((e: Error) => notifications.requestError(e))
          .finally(() => setLoadingData(false));
      });
    }
  }, [visible]);

  const renderPdf = (budget: Model.PdfBudget, contacts: Model.Contact[], opts: PdfBudgetTable.Options) => {
    setGeneratingPdf(true);
    const pdfComponent = BudgetPdfFunc(budget, contacts, opts);
    PDF(pdfComponent)
      .toBlob()
      .then((blb: Blob) => {
        util.files
          .getDataFromBlob(blb)
          .then((result: ArrayBuffer | string) => setFile(result))
          .catch((e: Error) => {
            console.error("There was an error generating the PDF.");
          })
          .finally(() => {
            setGeneratingPdf(false);
          });
      })
      .catch((e: Error) => {
        console.error("There was an error generating the PDF.");
        setGeneratingPdf(false);
      });
  };

  const debouncedSetOptions = useMemo(() => debounce(setOptions, 100), []);

  useEffect(() => {
    return () => {
      debouncedSetOptions.cancel();
    };
  }, []);

  useEffect(() => {
    if (!isNil(contactsResponse) && !isNil(budgetResponse)) {
      renderPdf(budgetResponse, contactsResponse.data, {
        ...options,
        notes: pdf.parsers.convertHtmlIntoNodes(options.notes || "") || [],
        header: {
          ...options.header,
          header: pdf.parsers.convertHtmlIntoNodes(options.header.header || "") || [],
          left_info: pdf.parsers.convertHtmlIntoNodes(options.header.left_info || "") || [],
          right_info: pdf.parsers.convertHtmlIntoNodes(options.header.right_info || "") || []
        }
      });
    }
  }, [contactsResponse, budgetResponse, options]);

  return (
    <Modal
      className={"export-preview-modal"}
      title={"Export"}
      visible={visible}
      onCancel={() => onCancel()}
      getContainer={false}
      footer={null}
    >
      <div className={"export-form-container"}>
        <ExportPdfForm
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
          accounts={!isNil(budgetResponse) ? budgetResponse.children : []}
          disabled={isNil(budgetResponse) || isNil(contactsResponse)}
          columns={SubAccountColumns}
          onValuesChange={(changedValues: Partial<ExportFormOptions>, values: ExportFormOptions) =>
            debouncedSetOptions(values)
          }
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
      </div>
      <Previewer
        file={file}
        generatingPdf={generatingPdf}
        loadingData={loadingData}
        onExport={() => {
          // TODO: Since we are debouncing the Options setState, should we rerender the
          // PDF with the most recent options just in case?
          if (!isNil(file)) {
            util.files.download(file, !filename.endsWith(".pdf") ? `${filename}.pdf` : filename, {
              includeExtensionInName: false
            });
            onSuccess?.();
          }
        }}
      />
    </Modal>
  );
};

export default PreviewModal;

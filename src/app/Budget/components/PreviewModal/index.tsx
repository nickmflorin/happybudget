import { useEffect, useState, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { pdf } from "@react-pdf/renderer";
import { isNil, map, debounce } from "lodash";

import * as api from "api";
import { registerFonts } from "style/pdf";
import { util, redux } from "lib";

import { Form, Modal } from "components";
import { ExportPdfForm } from "components/forms";

import { actions } from "../../store";

import BudgetPdf from "../BudgetPdf";
import Previewer from "./Previewer";
import { SubAccountColumns } from "../BudgetPdf/config";
import "./index.scss";

const BudgetPdfFunc = (budget: Model.PdfBudget, contacts: Model.Contact[], options: PdfBudgetTable.Options) => (
  <BudgetPdf budget={budget} contacts={contacts} options={options} />
);

const DEFAULT_OPTIONS: PdfBudgetTable.Options = {
  excludeZeroTotals: true,
  header: {
    header: [
      {
        type: "header",
        level: 2,
        data: [{ text: `Sample Budget ${new Date().getFullYear()}` }]
      },
      {
        type: "paragraph",
        data: [{ text: "Cost Summary" }]
      }
    ],
    left_image: null,
    right_image: null,
    left_info: [
      {
        type: "header",
        level: 4,
        data: [{ text: "Production Company" }]
      },
      {
        type: "paragraph",
        data: [{ text: "Address:" }]
      },
      {
        type: "paragraph",
        data: [{ text: "Phone:" }]
      }
    ],
    right_info: [
      {
        type: "header",
        level: 4,
        data: [{ text: "Client / Agency" }]
      },
      {
        type: "paragraph",
        data: [{ text: "Address:" }]
      },
      {
        type: "paragraph",
        data: [{ text: "Phone:" }]
      }
    ]
  },
  includeNotes: false,
  columns: map(
    SubAccountColumns,
    (column: PdfTable.Column<Tables.PdfSubAccountRowData, Model.PdfSubAccount>) => column.field
  )
};

interface PreviewModalProps {
  readonly onSuccess?: () => void;
  readonly onCancel: () => void;
  readonly autoRenderPdf?: boolean;
  readonly visible: boolean;
  readonly budgetId: ID;
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
  autoRenderPdf,
  filename,
  onSuccess,
  onCancel
}: PreviewModalProps): JSX.Element => {
  const initialPdfRender = useRef(false);
  const [loadingData, setLoadingData] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [options, setOptions] = useState<PdfBudgetTable.Options>({ ...DEFAULT_OPTIONS });

  // TODO: Should we just use the useContacts hook?
  const [contactsResponse, setContactsResponse] = useState<Http.ListResponse<Model.Contact> | null>(null);
  const [budgetResponse, setBudgetResponse] = useState<Model.PdfBudget | null>(null);

  const [file, setFile] = useState<string | ArrayBuffer | null>(null);
  const [form] = Form.useForm<PdfBudgetTable.Options>({ isInModal: true });
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
          .catch((e: Error) => api.handleRequestError(e))
          .finally(() => setLoadingData(false));
      });
    }
  }, [visible]);

  const renderPdf = (budget: Model.PdfBudget, contacts: Model.Contact[], opts: PdfBudgetTable.Options) => {
    setGeneratingPdf(true);
    const pdfComponent = BudgetPdfFunc(budget, contacts, opts);
    pdf(pdfComponent)
      .toBlob()
      .then((blb: Blob) => {
        util.files
          .getBase64(blb)
          .then((result: ArrayBuffer | string) => setFile(result))
          .catch((e: Error) => {
            // TODO: Appropriately handle error here by providing feedback.
            /* eslint-disable no-console */
            console.error(e);
          })
          .finally(() => {
            setGeneratingPdf(false);
          });
      })
      .catch((e: Error) => {
        // TODO: Appropriately handle error here by providing feedback.
        /* eslint-disable no-console */
        console.error(e);
        setGeneratingPdf(false);
      });
  };

  const debouncedRender = useMemo(() => {
    return () => {
      if (!isNil(contactsResponse) && !isNil(budgetResponse)) {
        renderPdf(budgetResponse, contactsResponse.data, options);
      }
    };
  }, [contactsResponse, budgetResponse, options]);

  useEffect(() => {
    if (!isNil(contactsResponse) && !isNil(budgetResponse)) {
      // If we are not auto rendering the PDF, we do not want to rerender]
      // automatically everytime the options change.
      if (initialPdfRender.current === false || autoRenderPdf) {
        renderPdf(budgetResponse, contactsResponse.data, options);
      }
      initialPdfRender.current = true;
    }
  }, [contactsResponse, budgetResponse, options, autoRenderPdf]);

  return (
    <Modal.Modal
      className={"export-preview-modal"}
      title={"Export"}
      visible={visible}
      onCancel={() => onCancel()}
      getContainer={false}
      footer={null}
    >
      <div className={"form-container"}>
        <ExportPdfForm
          form={form}
          initialValues={{
            ...DEFAULT_OPTIONS,
            header: {
              ...DEFAULT_OPTIONS.header,
              /* eslint-disable indent */
              header:
                !isNil(DEFAULT_OPTIONS.header) && !isNil(DEFAULT_OPTIONS.header.header)
                  ? [
                      { ...DEFAULT_OPTIONS.header.header[0], data: [{ text: budgetName }] },
                      ...DEFAULT_OPTIONS.header.header.slice(1)
                    ]
                  : null
            }
          }}
          loading={headerTemplateLoading}
          headerTemplates={headerTemplates}
          headerTemplatesLoading={headerTemplatesLoading}
          accountsLoading={loadingData}
          accounts={!isNil(budgetResponse) ? budgetResponse.accounts : []}
          disabled={isNil(budgetResponse) || isNil(contactsResponse)}
          columns={Object.values(SubAccountColumns)}
          onValuesChange={(changedValues: Partial<PdfBudgetTable.Options>, values: PdfBudgetTable.Options) => {
            const debouncedSetOptions = debounce(() => setOptions(values), 400);
            // We only care about debouncing the state set if the state set will result in
            // a rerender of the PDF.
            if (autoRenderPdf) {
              debouncedSetOptions();
            } else {
              setOptions(values);
            }
          }}
          displayedHeaderTemplate={displayedHeaderTemplate}
          onClearHeaderTemplate={() => dispatch(actions.pdf.clearHeaderTemplateAction(null))}
          onLoadHeaderTemplate={(id: ID) => dispatch(actions.pdf.loadHeaderTemplateAction(id))}
          onHeaderTemplateDeleted={(id: ID) => {
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
        onRefresh={() => debouncedRender()}
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
    </Modal.Modal>
  );
};

export default PreviewModal;

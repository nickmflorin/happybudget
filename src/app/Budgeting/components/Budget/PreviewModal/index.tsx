import { useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { isNil, map, debounce } from "lodash";

import * as api from "api";
import { registerFonts } from "style/pdf";
import { download, getBase64 } from "lib/util/files";

import { Form, Modal } from "components";
import { ExportForm } from "components/forms";

import BudgetPdf from "../BudgetPdf";
import Previewer from "./Previewer";
import { SubAccountColumns } from "../BudgetPdf/config";
import "./index.scss";

const BudgetPdfFunc = (budget: Model.PdfBudget, contacts: Model.Contact[], options: PdfBudgetTable.Options) => (
  <BudgetPdf budget={budget} contacts={contacts} options={options} />
);

interface PreviewModalProps {
  readonly onSuccess?: () => void;
  readonly onCancel: () => void;
  readonly visible: boolean;
  readonly budgetId: number;
  readonly filename: string;
}

type Column = PdfTable.Column<PdfBudgetTable.SubAccountRow, Model.PdfSubAccount>;

const DEFAULT_OPTIONS: PdfBudgetTable.Options = {
  excludeZeroTotals: true,
  leftImage: null,
  rightImage: null,
  leftInfo: [
    {
      type: "header",
      level: 4,
      data: { text: "Production Company" }
    },
    {
      type: "paragraph",
      data: { text: "Address:" }
    },
    {
      type: "paragraph",
      data: { text: "Phone:" }
    }
  ],
  rightInfo: [
    {
      type: "header",
      level: 4,
      data: { text: "Client / Agency" }
    },
    {
      type: "paragraph",
      data: { text: "Address:" }
    },
    {
      type: "paragraph",
      data: { text: "Phone:" }
    }
  ],
  includeNotes: false,
  columns: map(SubAccountColumns, (column: Column) => column.field),
  header: [
    {
      type: "header",
      level: 2,
      data: { text: `Sample Budget ${new Date().getFullYear()}` }
    },
    {
      type: "paragraph",
      data: { text: "Cost Summary" }
    }
  ]
};

const PreviewModal = ({ budgetId, visible, filename, onSuccess, onCancel }: PreviewModalProps): JSX.Element => {
  const [loadingData, setLoadingData] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [options, setOptions] = useState<PdfBudgetTable.Options>({ ...DEFAULT_OPTIONS });

  // TODO: Should we just use the useContacts hook?
  const [contactsResponse, setContactsResponse] = useState<Http.ListResponse<Model.Contact> | null>(null);
  const [budgetResponse, setBudgetResponse] = useState<Model.PdfBudget | null>(null);

  const [file, setFile] = useState<string | ArrayBuffer | null>(null);
  const [form] = Form.useForm<PdfBudgetTable.Options>({ isInModal: true });

  useEffect(() => {
    if (visible === true) {
      registerFonts();
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
    }
  }, [visible]);

  useEffect(() => {
    if (!isNil(contactsResponse) && !isNil(budgetResponse)) {
      setRendering(true);
      const pdfComponent = BudgetPdfFunc(budgetResponse, contactsResponse.data, options);
      pdf(pdfComponent)
        .toBlob()
        .then((blb: Blob) => {
          getBase64(blb)
            .then((result: ArrayBuffer | string) => setFile(result))
            .catch((e: Error) => {
              // TODO: Appropriately handle error here by providing feedback.
              /* eslint-disable no-console */
              console.error(e);
            });
        })
        .catch((e: Error) => {
          // TODO: Appropriately handle error here by providing feedback.
          /* eslint-disable no-console */
          console.error(e);
        })
        .finally(() => {
          setRendering(false);
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
      <div className={"form-container"}>
        <ExportForm
          form={form}
          initialValues={{ ...DEFAULT_OPTIONS }}
          accountsLoading={loadingData}
          accounts={!isNil(budgetResponse) ? budgetResponse.accounts : []}
          disabled={isNil(budgetResponse) || isNil(contactsResponse)}
          columns={map(SubAccountColumns, (value: Column) => value)}
          onValuesChange={(changedValues: Partial<PdfBudgetTable.Options>, values: PdfBudgetTable.Options) => {
            const debouncedSetState = debounce(() => setOptions(values), 400);
            debouncedSetState();
          }}
        />
      </div>
      <Previewer
        file={file}
        loading={rendering || loadingData}
        exportDisabled={rendering || loadingData}
        onExport={() => {
          // TODO: Since we are debouncing the Options setState, should we rerender the
          // PDF with the most recent options just in case?
          if (!isNil(file)) {
            download(file, !filename.endsWith(".pdf") ? `${filename}.pdf` : filename, {
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

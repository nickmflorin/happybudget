import { useEffect, useState, useRef, useMemo } from "react";

import classNames from "classnames";
import { isNil, map, filter } from "lodash";

import * as api from "api";
import { ui, tabling, pdf, util, http } from "lib";
import * as store from "store";
import { ExportBudgetPdfForm } from "components/forms";
import { PreviewModal } from "components/modals";
import { SubAccountsTable } from "tabling";

import BudgetPdf from "./BudgetPdf";

type R = Tables.SubAccountRowData;
type M = Model.PdfSubAccount;
type C = Table.DataColumn<R, M>;

const SubAccountColumns = filter(
  SubAccountsTable.Columns,
  (c: Table.Column<R, M>) => tabling.columns.isDataColumn(c) && c.includeInPdf !== false,
) as C[];

const DEFAULT_OPTIONS: ExportBudgetPdfFormOptions = {
  date: util.dates.toDisplayDate() as string,
  excludeZeroTotals: false,
  header: {
    header: `<h2>Sample Budget ${new Date().getFullYear()}</h2><p>Cost Summary</p>`,
    left_image: null,
    right_image: null,
    left_info: "<h6>Production Company</h6><p>Address:</p><p>Phone:</p>",
    right_info: "<h6>Client / Agency</h6><p>Address:</p><p>Phone:</p>",
  },
  includeNotes: false,
  columns: filter(
    map(SubAccountColumns, (column: C) => tabling.columns.normalizedField<R, M>(column)),
    (field: string | undefined) => !isNil(field),
  ),
};

interface BudgetPdfFuncProps {
  readonly budget: Model.PdfBudget;
  readonly contacts: Model.Contact[];
  readonly options: PdfBudgetTable.Options;
}

const BudgetPdfFunc = (props: BudgetPdfFuncProps): JSX.Element => <BudgetPdf {...props} />;

interface PreviewModalProps extends ModalProps {
  readonly budgetId: number;
  readonly budgetName: string;
  readonly filename: string;
  readonly initiallyRender?: boolean;
  readonly onSuccess?: () => void;
}

const BudgetPreviewModal = ({
  budgetId,
  budgetName,
  filename,
  initiallyRender,
  onSuccess,
  ...props
}: PreviewModalProps): JSX.Element => {
  const previewer = useRef<Pdf.IPreviewerRef>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [getToken] = http.useCancelToken({ preserve: true, createOnInit: true });

  const cs = store.hooks.useContacts();

  const [budget, setBudget] = useState<Model.PdfBudget | null>(null);
  const [options, setOptions] = useState<ExportBudgetPdfFormOptions>(DEFAULT_OPTIONS);

  const form = ui.form.useForm<ExportBudgetPdfFormOptions>({ isInModal: true });
  const modal = ui.useModal();

  const convertOptions = useMemo(
    () =>
      (opts: ExportBudgetPdfFormOptions): PdfBudgetTable.Options => ({
        ...opts,
        notes: pdf.parsers.convertHtmlIntoNodes(opts.notes || "") || [],
        header: {
          ...opts.header,
          header: pdf.parsers.convertHtmlIntoNodes(opts.header.header || "") || [],
          left_info: pdf.parsers.convertHtmlIntoNodes(opts.header.left_info || "") || [],
          right_info: pdf.parsers.convertHtmlIntoNodes(opts.header.right_info || "") || [],
        },
      }),
    [],
  );

  useEffect(() => {
    setOptions({
      ...DEFAULT_OPTIONS,
      header: {
        ...DEFAULT_OPTIONS.header,
        header: `<h2>${budgetName}</h2><p>Cost Summary</p>`,
      },
    });
  }, [budgetName]);

  useEffect(() => {
    if (props.open === true) {
      api
        .getBudgetPdf(budgetId, { cancelToken: getToken() })
        .then((response: Model.PdfBudget) => {
          setBudget(response);
          /* Since @react-pdf blocks the entire UI thread (which is ridiculous),
						 this is usually not desirable as rendering large PDF's once the
						 modal is open will prevent the form from being edited until the
						 PDF finishes rendering. */
          if (initiallyRender === true) {
            const pdfComponent = BudgetPdfFunc({
              budget: response,
              contacts: cs,
              options: convertOptions(options),
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
  }, [props.open, initiallyRender]);

  const renderComponent = useMemo(
    () => () => {
      if (!isNil(budget)) {
        return BudgetPdfFunc({
          budget,
          contacts: cs,
          options: convertOptions(options),
        });
      }
    },
    [budget, cs, options],
  );

  return (
    <PreviewModal
      {...props}
      previewer={previewer}
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
            header: `<h2>${budgetName}</h2><p>Cost Summary</p>`,
          },
        }}
        accountsLoading={loadingData}
        accounts={!isNil(budget) ? budget.children : []}
        columns={SubAccountColumns}
        onValuesChange={(
          changedValues: Partial<ExportBudgetPdfFormOptions>,
          values: ExportBudgetPdfFormOptions,
        ) => {
          setOptions(values);
          previewer.current?.refreshRequired();
        }}
      />
    </PreviewModal>
  );
};

export default BudgetPreviewModal;

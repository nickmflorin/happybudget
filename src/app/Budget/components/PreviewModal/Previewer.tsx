import React, { useEffect, useMemo, useState, forwardRef, ForwardedRef, useImperativeHandle } from "react";
import { Page } from "react-pdf/dist/esm/entry.webpack";
import { pdf as PDF } from "@react-pdf/renderer";
import { debounce } from "lodash";

import { Pagination } from "antd";

import { util, pdf } from "lib";

import { ShowHide } from "components";
import { Button } from "components/buttons";
import { RenderDocument } from "components/pdf";

import BudgetPdf from "../BudgetPdf";
import { isNil } from "lodash";

interface PreviewerProps {
  readonly onExport: () => void;
  readonly loadingData?: boolean;
  readonly onRefresh: () => void;
}

export interface IPreviewerRef {
  readonly render: (budget: Model.PdfBudget, contacts: Model.Contact[], opts: ExportFormOptions) => void;
  readonly debouncedRender: (budget: Model.PdfBudget, contacts: Model.Contact[], opts: ExportFormOptions) => void;
  readonly export: (filename: string, onSuccess?: () => void) => void;
  readonly refreshRequired: () => void;
}

interface BudgetPdfFuncProps {
  readonly budget: Model.PdfBudget;
  readonly contacts: Model.Contact[];
  readonly options: PdfBudgetTable.Options;
}

const BudgetPdfFunc = (props: BudgetPdfFuncProps): JSX.Element => <BudgetPdf {...props} />;

const Previewer = (
  { onExport, loadingData, onRefresh }: PreviewerProps,
  ref: ForwardedRef<IPreviewerRef>
): JSX.Element => {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [file, setFile] = useState<string | ArrayBuffer | null>(null);
  const [refreshRequired, setRefreshRequired] = useState(false);

  const convertOptions = useMemo(
    () =>
      (opts: ExportFormOptions): PdfBudgetTable.Options => ({
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

  const render = useMemo(
    () => async (budget: Model.PdfBudget, contacts: Model.Contact[], opts: ExportFormOptions) => {
      const pdfComponent = BudgetPdfFunc({ budget, contacts, options: convertOptions(opts) });
      if (!isNil(pdfComponent)) {
        setGeneratingPdf(true);
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
      }
    },
    []
  );

  const debouncedRender = useMemo(() => debounce(render, 20), []);
  const debouncedRefresh = useMemo(() => debounce(onRefresh, 20), []);

  useEffect(() => {
    return () => {
      debouncedRender.cancel();
      debouncedRefresh.cancel();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    render,
    debouncedRender,
    refreshRequired: () => setRefreshRequired(true),
    export: (filename: string, onSuccess?: () => void) => {
      if (!isNil(file)) {
        util.files.download(file, !filename.endsWith(".pdf") ? `${filename}.pdf` : filename, {
          includeExtensionInName: false
        });
        onSuccess?.();
      }
    }
  }));

  return (
    <div className={"previewer"}>
      <ShowHide show={refreshRequired}>
        <Button
          className={"btn btn--over"}
          disabled={generatingPdf || loadingData}
          onClick={() => {
            setRefreshRequired(false);
            onRefresh();
          }}
        >
          {"Refresh"}
        </Button>
      </ShowHide>
      <div className={"preview-content"}>
        <RenderDocument
          file={file}
          loadingOnNoFile={true}
          loading={generatingPdf}
          onLoadSuccess={(p: Pdf.DocumentLoadedParams) => {
            setNumPages(p.numPages);
            if (page > p.numPages) {
              setPage(1);
            }
          }}
        >
          <Page pageNumber={page} />
        </RenderDocument>
      </div>
      <div className={"preview-footer"}>
        <Pagination total={numPages} pageSize={1} current={page} size={"small"} onChange={(p: number) => setPage(p)} />
        <Button
          className={"btn btn--primary"}
          htmlType={"submit"}
          disabled={generatingPdf || loadingData}
          onClick={() => onExport()}
        >
          {"Export"}
        </Button>
      </div>
    </div>
  );
};

export default React.memo(forwardRef(Previewer));

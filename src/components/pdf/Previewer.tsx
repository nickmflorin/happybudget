import { useEffect, useMemo, useState, RefObject, useImperativeHandle } from "react";
import { Page } from "react-pdf/dist/esm/entry.webpack";
import { pdf as PDF } from "@react-pdf/renderer";
import { debounce, isNil } from "lodash";

import { Pagination } from "antd";

import { util, hooks } from "lib";
import { registerFonts } from "style/pdf";

import { Button } from "components/buttons";
import { RenderDocument } from "./primitive";

import "./Previewer.scss";

export interface PreviewerProps {
  readonly filename: string;
  readonly previewer?: RefObject<Pdf.IPreviewerRef>;
  readonly loadingData?: boolean;
  readonly regenerateFileOnExport?: boolean;
  readonly renderComponent: () => JSX.Element | undefined;
  readonly onExportSuccess?: () => void;
  readonly onRenderError: (e: Error) => void;
}

const generateFile = async (component: JSX.Element): Promise<string | ArrayBuffer> =>
  new Promise<ArrayBuffer | string>((resolve, reject) => {
    registerFonts()
      .then(() =>
        PDF(component)
          .toBlob()
          .then((blb: Blob) => {
            util.files
              .getDataFromBlob(blb)
              .then((result: ArrayBuffer | string) => resolve(result))
              .catch((e: Error) => reject(e));
          })
          .catch((e: Error) => reject(e))
      )
      .catch((e: Error) => reject(e));
  });

const Previewer = ({
  loadingData,
  regenerateFileOnExport,
  filename,
  previewer,
  renderComponent,
  onExportSuccess,
  onRenderError
}: PreviewerProps): JSX.Element => {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [file, setFile] = useState<string | ArrayBuffer | null>(null);
  const [refreshRequired, setRefreshRequired] = useState(false);

  const render = useMemo(
    () => async (component?: JSX.Element) => {
      let pdfComponent: JSX.Element | undefined;
      if (!isNil(component)) {
        pdfComponent = component;
      } else {
        pdfComponent = renderComponent();
      }
      if (!isNil(pdfComponent)) {
        setGeneratingPdf(true);
        generateFile(pdfComponent)
          .then((result: ArrayBuffer | string) => setFile(result))
          .catch((e: Error) => onRenderError(e))
          .finally(() => setGeneratingPdf(false));
      }
    },
    [renderComponent]
  );

  const debouncedRender = useMemo(() => debounce(render, 20), []);

  const exportPdf = hooks.useDynamicCallback((params: Pdf.IPreviewerExportParams) => {
    // The default behavior is to regenerate the file on export.
    let fname = params.filename || filename;
    if (regenerateFileOnExport === false) {
      if (!isNil(file)) {
        util.files.download(file, !fname.endsWith(".pdf") ? `${fname}.pdf` : fname, {
          includeExtensionInName: false
        });
        onExportSuccess?.();
      }
    } else {
      setExporting(true);
      let pdfComponent: JSX.Element | undefined;
      if (!isNil(params.component)) {
        pdfComponent = params.component;
      } else {
        pdfComponent = renderComponent();
      }
      if (!isNil(pdfComponent)) {
        generateFile(pdfComponent)
          .then((f: ArrayBuffer | string) => {
            util.files.download(f, !fname.endsWith(".pdf") ? `${fname}.pdf` : fname, {
              includeExtensionInName: false
            });
            onExportSuccess?.();
          })
          .catch((e: Error) => onRenderError(e))
          .finally(() => setExporting(false));
      } else {
        setExporting(false);
      }
    }
  });

  useEffect(() => {
    return () => {
      debouncedRender.cancel();
    };
  }, []);

  useImperativeHandle(previewer, () => ({
    render,
    debouncedRender,
    refreshRequired: () => setRefreshRequired(true),
    export: exportPdf
  }));

  return (
    <div className={"previewer"}>
      {refreshRequired && (
        <Button
          className={"btn btn--over"}
          disabled={generatingPdf || loadingData}
          onClick={async () => {
            setRefreshRequired(false);
            await render();
          }}
        >
          {"Refresh"}
        </Button>
      )}
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
          disabled={generatingPdf || loadingData || exporting}
          loading={exporting}
          onClick={() => exportPdf({})}
        >
          {"Export"}
        </Button>
      </div>
    </div>
  );
};

export default Previewer;

import React, { useEffect, useMemo, useState, forwardRef, ForwardedRef, useImperativeHandle } from "react";
import { Page } from "react-pdf/dist/esm/entry.webpack";
import { pdf as PDF } from "@react-pdf/renderer";
import { debounce, isNil } from "lodash";

import { Pagination } from "antd";

import { util } from "lib";

import { Button } from "components/buttons";
import { RenderDocument } from "./primitive";

import "./Previewer.scss";

interface PreviewerProps {
  readonly onExport: () => void;
  readonly loadingData?: boolean;
  readonly renderComponent: () => JSX.Element | undefined;
}

const Previewer = (
  { onExport, loadingData, renderComponent }: PreviewerProps,
  ref: ForwardedRef<Pdf.IPreviewerRef>
): JSX.Element => {
  const [generatingPdf, setGeneratingPdf] = useState(false);
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

  useEffect(() => {
    return () => {
      debouncedRender.cancel();
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
      {refreshRequired && (
        <Button
          className={"btn btn--over"}
          disabled={generatingPdf || loadingData}
          onClick={() => {
            setRefreshRequired(false);
            render();
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

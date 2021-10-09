import { useState } from "react";
import { Page } from "react-pdf/dist/esm/entry.webpack";

import { Pagination } from "antd";

import { Button } from "components/buttons";
import { RenderDocument } from "components/pdf";

interface PreviewerProps {
  readonly file?: string | ArrayBuffer | null;
  readonly generatingPdf?: boolean;
  readonly onExport: () => void;
  readonly loadingData?: boolean;
}

const Previewer = ({ file, generatingPdf, onExport, loadingData }: PreviewerProps): JSX.Element => {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);

  return (
    <div className={"previewer"}>
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

export default Previewer;

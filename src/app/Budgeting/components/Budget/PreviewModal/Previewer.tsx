import { useState } from "react";
import { Page } from "react-pdf/dist/esm/entry.webpack";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";

import { Pagination } from "antd";

import { Button } from "components/buttons";
import { RenderDocument } from "components/pdf";

interface PreviewerProps {
  readonly file?: string | ArrayBuffer | null;
  readonly loading?: boolean;
  readonly onExport: () => void;
  readonly exportDisabled?: boolean;
}

const Previewer = ({ file, loading, onExport, exportDisabled }: PreviewerProps): JSX.Element => {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);

  return (
    <div className={"previewer"}>
      <div className={"preview-header"}>
        <Button
          className={classNames("btn--refresh-pdf", loading ? "loading" : "")}
          onClick={() => console.log("test")}
          disabled={loading}
          icon={<FontAwesomeIcon icon={faRedo} />}
        >
          {"Refresh Preview"}
        </Button>
      </div>
      <div className={"preview-content"}>
        <RenderDocument
          file={file}
          loadingOnNoFile={true}
          loading={loading}
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
        <Button className={"btn btn--primary"} htmlType={"submit"} disabled={exportDisabled} onClick={() => onExport()}>
          {"Export"}
        </Button>
      </div>
    </div>
  );
};

export default Previewer;

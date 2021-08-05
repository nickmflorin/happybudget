import { pdfjs, Document as ReactPdfDoc } from "react-pdf/dist/esm/entry.webpack";
import { isNil } from "lodash";

import { WrappedSpinner, RenderOrSpinner } from "components";
import "./RenderDocument.scss";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const RenderDocument = ({ loading, onLoadStarted, ...props }: Pdf.RenderDocumentProps): JSX.Element => {
  return (
    <RenderOrSpinner loading={loading || (isNil(props.file) && props.loadingOnNoFile === true)}>
      {!isNil(props.file) && (
        <ReactPdfDoc
          loading={<WrappedSpinner />}
          {...props}
          file={props.file}
          options={{ workerSrc: "/pdf.worker.js" }}
        />
      )}
    </RenderOrSpinner>
  );
};

export default RenderDocument;

import { pdfjs, Document as ReactPdfDoc } from "react-pdf/dist/esm/entry.webpack";

import { WrappedSpinner, RenderOrSpinner } from "components";
import { isNil } from "lodash";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const RenderDocument = (props: Pdf.RenderDocumentProps): JSX.Element => {
  return (
    <RenderOrSpinner loading={isNil(props.file) && props.loadingOnNoFile === true}>
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

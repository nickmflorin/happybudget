import { useState, useEffect } from "react";
import { pdfjs, Document as ReactPdfDoc } from "react-pdf/dist/esm/entry.webpack";
import { isNil } from "lodash";

import { WrappedSpinner, RenderOrSpinner } from "components";
import "./RenderDocument.scss";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const RenderDocument = ({ loading, ...props }: Pdf.RenderDocumentProps): JSX.Element => {
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    setIsRendering(!isNil(props.file) ? true : false);
  }, [props.file]);

  return (
    <RenderOrSpinner loading={loading || (isNil(props.file) && props.loadingOnNoFile === true)}>
      {!isNil(props.file) && (
        <div className={!isRendering ? "fade-in-animation" : "fade-out-animation"}>
          <ReactPdfDoc
            loading={<WrappedSpinner />}
            {...props}
            file={props.file}
            options={{ workerSrc: "/pdf.worker.js" }}
            onLoadSuccess={(p: Pdf.DocumentLoadedParams) => {
              setIsRendering(false);
              props.onLoadSuccess?.(p);
            }}
            onLoadError={(error: Error) => {
              setIsRendering(false);
              props.onLoadError?.(error);
            }}
          />
        </div>
      )}
    </RenderOrSpinner>
  );
};

export default RenderDocument;

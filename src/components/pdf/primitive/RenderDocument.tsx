import { useState, useEffect } from "react";

import { pdfjs, Document as ReactPdfDoc } from "react-pdf/dist/esm/entry.webpack";

import { WrappedSpinner, RenderOrSpinner } from "components";
import { isNil } from "lodash";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const RenderDocument = (props: Pdf.RenderDocumentProps): JSX.Element => {
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    setIsRendering(!isNil(props.file) ? true : false);
  }, [props.file]);

  return (
    <RenderOrSpinner loading={isNil(props.file) && props.loadingOnNoFile === true}>
      {!isNil(props.file) && (
        <div className={!isRendering ? "fade-in-animation" : "fade-out-animation"}>
          <ReactPdfDoc
            loading={<WrappedSpinner />}
            {...props}
            file={props.file}
            options={{ workerSrc: "/pdf.worker.js" }}
            onLoadSuccess={() => setIsRendering(false)}
            onLoadError={() => setIsRendering(false)}
          />
        </div>
      )}
    </RenderOrSpinner>
  );
};

export default RenderDocument;

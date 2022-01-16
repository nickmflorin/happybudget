import { Document } from "./primitive";
import NoDataPage from "./NoDataPage";

const EmptyDocument = (props: Pdf.NoDataDocumentProps): JSX.Element => (
  <Document>
    <NoDataPage {...props} />
  </Document>
);

export default EmptyDocument;

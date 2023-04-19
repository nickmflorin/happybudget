import NoDataPage from "./NoDataPage";
import { Document } from "./primitive";

const EmptyDocument = (props: Pdf.NoDataDocumentProps): JSX.Element => (
  <Document>
    <NoDataPage {...props} />
  </Document>
);

export default EmptyDocument;

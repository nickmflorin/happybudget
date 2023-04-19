import { Document as ReactPDFDocument } from "@react-pdf/renderer";

const Document = (props: Pdf.DocumentProps): JSX.Element => (
  <ReactPDFDocument {...props} creator="saturation.io" producer="saturation.io" />
);

export default Document;

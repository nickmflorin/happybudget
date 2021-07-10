import { View as ReactPDFView } from "@react-pdf/renderer";
import createPdfComponent, { PdfComponentProps } from "./createPdfComponent";

const View = createPdfComponent<Omit<PdfComponentProps, "render">>(ReactPDFView);

export default View;

import { View as ReactPDFView } from "@react-pdf/renderer";
import createPdfComponent from "./createPdfComponent";

const View = createPdfComponent(ReactPDFView);

export default View;

import { Text as ReactPDFText } from "@react-pdf/renderer";
import createPdfComponent from "./createPdfComponent";

const Text = createPdfComponent(ReactPDFText);

export default Text;

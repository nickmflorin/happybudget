import { ReactNode } from "react";
import { View as ReactPDFView } from "@react-pdf/renderer";
import createPdfComponent, { PdfComponentProps } from "./createPdfComponent";

interface ViewPdfComponentProps extends PdfComponentProps {
  readonly render?: (params: { pageNumber: number; subPageNumber: number }) => ReactNode;
}

const View = createPdfComponent<ViewPdfComponentProps>(ReactPDFView);

export default View;

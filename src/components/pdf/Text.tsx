import { ReactNode } from "react";
import { Text as ReactPDFText } from "@react-pdf/renderer";
import createPdfComponent, { PdfComponentProps } from "./createPdfComponent";

interface TextPdfComponentProps extends PdfComponentProps {
  readonly render?: (params: {
    pageNumber: number;
    totalPages: number;
    subPageNumber: number;
    subPageTotalPages: number;
  }) => ReactNode;
}

const Text = createPdfComponent<TextPdfComponentProps>(ReactPDFText);

export default Text;

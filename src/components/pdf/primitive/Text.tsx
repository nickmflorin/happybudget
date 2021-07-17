import { ReactNode } from "react";
import { Text as ReactPDFText } from "@react-pdf/renderer";
import createPdfComponent from "./createPdfComponent";

export interface TextProps extends StandardPdfComponentProps {
  readonly render?: (params: {
    pageNumber: number;
    totalPages: number;
    subPageNumber: number;
    subPageTotalPages: number;
  }) => ReactNode;
}

const Text = createPdfComponent<TextProps>(ReactPDFText);

export default Text;

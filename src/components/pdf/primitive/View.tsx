import { ReactNode } from "react";
import { View as ReactPDFView } from "@react-pdf/renderer";
import createPdfComponent from "./createPdfComponent";

export interface ViewProps extends StandardPdfComponentProps {
  readonly render?: (params: { pageNumber: number; subPageNumber: number }) => ReactNode;
}

const View = createPdfComponent<ViewProps>(ReactPDFView);

export default View;

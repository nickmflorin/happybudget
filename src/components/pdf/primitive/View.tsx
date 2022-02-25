import { ComponentProps } from "react";
import { View as ReactPDFView } from "@react-pdf/renderer";
import createPdfComponent from "./createPdfComponent";

export type ViewProps = ComponentProps<typeof ReactPDFView> & { readonly className?: string };

const View = createPdfComponent(ReactPDFView);

export default View;

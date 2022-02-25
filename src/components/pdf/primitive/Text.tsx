import { ComponentProps } from "react";
import { Text as ReactPDFText } from "@react-pdf/renderer";
import createPdfComponent from "./createPdfComponent";

export type TextProps = ComponentProps<typeof ReactPDFText> & { readonly className?: string };

const Text = createPdfComponent(ReactPDFText);

export default Text;

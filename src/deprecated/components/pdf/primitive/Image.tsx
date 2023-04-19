import { ComponentProps } from "react";

import { Image as ReactPDFImage } from "@react-pdf/renderer";

import createPdfComponent from "./createPdfComponent";

export type ImageProps = ComponentProps<typeof ReactPDFImage>;

const Image = createPdfComponent(ReactPDFImage);

export default Image;

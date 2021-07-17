import { Image as ReactPDFImage } from "@react-pdf/renderer";
import { SourceObject } from "@react-pdf/types";
import createPdfComponent from "./createPdfComponent";

interface ImageProps extends StandardPdfComponentProps {
  debug?: boolean;
  cache?: boolean;
  src: SourceObject;
}

/* @ts-ignore React-PDF Image Props are Wonky with "src" vs "source" */
const Image = createPdfComponent<ImageProps>(ReactPDFImage);

export default Image;

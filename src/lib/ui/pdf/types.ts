import { ReactNode } from "react";

import Renderer from "@react-pdf/renderer";
import { Style, PageSize, SVGPresentationAttributes } from "@react-pdf/types";

import { SingleOrArray } from "../../util";
import * as types from "../types";

export type PdfStyle = Style;

export type PdfStyles = Renderer.Styles;

export type StandardPdfComponentProps = {
  readonly className?: string;
  readonly style?: PdfStyle | PdfStyle[];
  readonly debug?: boolean;
  readonly children?: ReactNode;
  readonly fixed?: boolean;
  readonly wrap?: boolean;
};

export type StandardPdfTextComponentProps = Omit<StandardPdfComponentProps, "style"> & {
  readonly style?: PdfStyle | PdfStyle[] | SVGPresentationAttributes;
};

export type PdfExtensionStyle = Style & {
  ext?: SingleOrArray<string>;
  fontFamily?: types.FontFamily;
};

export type PdfExtensionStyles = { [key: string]: PdfExtensionStyle };

export type PdfHTMLNodeType = "paragraph" | "header" | "text" | "fontStyle";
export type PdfHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type PdfSupportedFontStyleTag = "i" | "b" | "strong";
export type PdfSupportedHeaderTag = `h${PdfHeadingLevel}`;
export type PdfSupportedParagraphTag = "p";
export type PdfSupportedHTMLTag =
  | PdfSupportedHeaderTag
  | PdfSupportedParagraphTag
  | PdfSupportedFontStyleTag;

export type PdfFontStyleName = "italic" | "bold";

export interface IHTMLPdfNode<
  T extends PdfHTMLNodeType,
  D,
  Tag extends PdfSupportedHTMLTag | null,
> {
  readonly type: T;
  readonly data: D;
  readonly tag: Tag;
}

export type HTMLPdfTextNode = IHTMLPdfNode<"text", string, null>;
export type HTMLPdfFontStyleNode = IHTMLPdfNode<
  "fontStyle",
  string | Array<HTMLPdfNode>,
  PdfSupportedFontStyleTag
>;
export type HTMLPdfParagraphNode = IHTMLPdfNode<
  "paragraph",
  string | Array<HTMLPdfNode>,
  PdfSupportedParagraphTag
>;
export type HTMLPdfHeadingNode = IHTMLPdfNode<
  "header",
  string | Array<HTMLPdfNode>,
  PdfSupportedHeaderTag
>;

export type HTMLPdfNode =
  | HTMLPdfTextNode
  | HTMLPdfParagraphNode
  | HTMLPdfHeadingNode
  | HTMLPdfFontStyleNode;

export type PdfSupportedFontStyle = { name: PdfFontStyleName; tag: PdfSupportedFontStyleTag };

export type PdfFont = {
  readonly src: string;
  readonly fontWeight: types.FontWeight;
  readonly fontStyle?: "italic";
};

export type PdfDocumentLoadedParams = {
  readonly numPages: number;
};

export type PdfDocumentProps = Renderer.DocumentProps & {
  children: JSX.Element | JSX.Element[];
};

export type PdfPageRenderParams = {
  readonly pageNumber: number;
};

export type PdfRenderDocumentProps = {
  readonly title?: string;
  readonly file?: string | ArrayBuffer | null;
  readonly loading?: boolean;
  readonly onLoadSuccess?: (params: PdfDocumentLoadedParams) => void;
  readonly onLoadError?: (error: Error) => void;
  readonly onLoadStarted?: () => void;
  readonly children: JSX.Element;
  readonly loadingOnNoFile?: boolean;
};

export type IPdfPreviewerExportParams = {
  readonly filename?: string;
  readonly component?: JSX.Element;
  readonly onSuccess?: () => void;
};

export type PdfNoDataDocumentProps = StandardPdfComponentProps & {
  readonly size?: PageSize;
  readonly debug?: boolean;
  readonly text?: string | boolean;
};

export type IPdfPreviewerRef = {
  readonly render: (component?: JSX.Element) => void;
  readonly renderEmptyDocument: (props?: PdfNoDataDocumentProps) => void;
  readonly debouncedRender: () => void;
  readonly export: (params: IPdfPreviewerExportParams) => void;
  readonly refreshRequired: () => void;
};

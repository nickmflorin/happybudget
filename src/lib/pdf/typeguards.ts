import { includes, map } from "lodash";

export const SupportedPdfFontStyles: Pdf.SupportedFontStyle[] = [
  { name: "bold", tag: "b" },
  { name: "bold", tag: "strong" },
  { name: "italic", tag: "i" }
];

export const SupportedHeaderTags: Pdf.SupportedHeaderTag[] = ["h1", "h2", "h3", "h4", "h5", "h6"];
export const SupportedParagraphTags: Pdf.SupportedParagraphTag[] = ["p"];

export const SupportedFontStyleTags: Pdf.SupportedFontStyleTag[] = map(
  SupportedPdfFontStyles,
  (style: Pdf.SupportedFontStyle) => style.tag
);

export const SupportedTags = [...SupportedHeaderTags, ...SupportedParagraphTags, ...SupportedFontStyleTags];

export const isSupportedTag = (tag: string): tag is Pdf.SupportedHTMLTag =>
  includes(SupportedTags, tag.toLocaleLowerCase());

export const isHeaderTag = (tag: Pdf.SupportedHTMLTag): tag is Pdf.SupportedHeaderTag =>
  includes(SupportedHeaderTags, tag.toLocaleLowerCase());

export const isParagraphTag = (tag: Pdf.SupportedHTMLTag): tag is Pdf.SupportedParagraphTag =>
  includes(SupportedParagraphTags, tag.toLocaleLowerCase());

export const isFontStyleTag = (tag: Pdf.SupportedHTMLTag): tag is Pdf.SupportedFontStyleTag =>
  includes(SupportedFontStyleTags, tag.toLocaleLowerCase());

export const isParagraphNode = (node: Pdf.HTMLNode): node is Pdf.HTMLParagraphNode =>
  (node as Pdf.HTMLParagraphNode).type === "paragraph";

export const isHeadingNode = (node: Pdf.HTMLNode): node is Pdf.HTMLHeadingNode =>
  (node as Pdf.HTMLHeadingNode).type === "header";

export const isTextNode = (node: Pdf.HTMLNode): node is Pdf.HTMLTextNode => (node as Pdf.HTMLTextNode).type === "text";

export const isFontStyleNode = (node: Pdf.HTMLNode): node is Pdf.HTMLFontStyleNode =>
  (node as Pdf.HTMLFontStyleNode).type === "fontStyle";

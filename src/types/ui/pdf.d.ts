/* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
namespace Pdf {
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Style = import("@react-pdf/types").Style;
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Styles = import("@react-pdf/renderer").default.Styles;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ExtensionStyle = ReactPdfStyle & { ext?: SingleOrArray<string>, fontFamily?: FontFamily };
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type ExtensionStyles = {[key: string]: ExtensionStyle};

  type HTMLNodeType = "paragraph" | "header" | "text" | "fontStyle";
  type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

  type SupportedFontStyleTag = "i" | "b" | "strong";
  type SupportedHeaderTag = `h${HeadingLevel}`;
  type SupportedParagraphTag = "p";
  type SupportedHTMLTag = SupportedHeaderTag | SupportedParagraphTag | SupportedFontStyleTag;

  type FontStyleName = "italic" | "bold";

  interface IHTMLNode<
    T extends HTMLNodeType,
    D,
    Tag extends SupportedHTMLTag | null
  > {
    readonly type: T;
    readonly data: D;
    readonly tag: Tag;
  }

  type HTMLTextNode = IHTMLNode<"text", string, null>;
  type HTMLFontStyleNode = IHTMLNode<
    "fontStyle",
    string | Array<HTMLNode>,
    SupportedFontStyleTag
  >;
  type HTMLParagraphNode = IHTMLNode<
    "paragraph",
    string | Array<HTMLNode>,
    SupportedParagraphTag
  >;
  type HTMLHeadingNode = IHTMLNode<
    "header",
    string | Array<HTMLNode>,
    SupportedHeaderTag
  >;

  type HTMLNode = HTMLTextNode | HTMLParagraphNode | HTMLHeadingNode | HTMLFontStyleNode;

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type SupportedFontStyle = { name: FontStyleName, tag: SupportedFontStyleTag };
  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type Font = {
    readonly src: any;
    readonly fontWeight: FontWeight;
    readonly fontStyle?: "italic";
  };

  type DocumentLoadedParams = {
    readonly numPages: number;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type DocumentProps = import("@react-pdf/renderer").default.DocumentProps & {children: JSX.Element | JSX.Element[]};

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type PageRenderParams = {
    readonly pageNumber: number;
  }

  /* eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars */
  type RenderDocumentProps = {
    readonly title?: string;
    readonly file?: string | ArrayBuffer | null;
    readonly loading?: boolean;
    readonly onLoadSuccess?: (params: DocumentLoadedParams) => void;
    readonly onLoadError?: (error: Error) => void;
    readonly onLoadStarted?: () => void;
    readonly children: JSX.Element;
    readonly loadingOnNoFile?: boolean;
  }
}
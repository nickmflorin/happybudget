declare namespace Pdf {

  type Style = import("@react-pdf/types").Style;

  type Styles = import("@react-pdf/renderer").default.Styles;

  type ExtensionStyle = ReactPdfStyle & { ext?: SingleOrArray<string>, fontFamily?: FontFamily };

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

  type SupportedFontStyle = { name: FontStyleName, tag: SupportedFontStyleTag };

  type Font = {
    readonly src: any;
    readonly fontWeight: FontWeight;
    readonly fontStyle?: "italic";
  };

  type DocumentLoadedParams = {
    readonly numPages: number;
  }

  type DocumentProps = import("@react-pdf/renderer").default.DocumentProps & {children: JSX.Element | JSX.Element[]};

  type PageRenderParams = {
    readonly pageNumber: number;
  }

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

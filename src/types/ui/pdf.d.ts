declare namespace Pdf {
  type Style = import("@react-pdf/types").Style;

  type Styles = import("@react-pdf/renderer").default.Styles;

  type StandardComponentProps = {
    readonly className?: string;
    readonly style?: Pdf.Style | Pdf.Style[];
    readonly debug?: boolean;
    readonly children?: import("react").ReactNode;
    readonly fixed?: boolean;
    readonly wrap?: boolean;
  };

  type StandardTextComponentProps = Omit<StandardComponentProps, "style"> & {
    readonly style?: Pdf.Style | Pdf.Style[] | import("@react-pdf/types").SVGPresentationAttributes;
  };

  type ExtensionStyle = Style & { ext?: SingleOrArray<string>; fontFamily?: Style.FontFamily };

  type ExtensionStyles = { [key: string]: ExtensionStyle };

  type HTMLNodeType = "paragraph" | "header" | "text" | "fontStyle";
  type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

  type SupportedFontStyleTag = "i" | "b" | "strong";
  type SupportedHeaderTag = `h${HeadingLevel}`;
  type SupportedParagraphTag = "p";
  type SupportedHTMLTag = SupportedHeaderTag | SupportedParagraphTag | SupportedFontStyleTag;

  type FontStyleName = "italic" | "bold";

  interface IHTMLNode<T extends HTMLNodeType, D, Tag extends SupportedHTMLTag | null> {
    readonly type: T;
    readonly data: D;
    readonly tag: Tag;
  }

  type HTMLTextNode = IHTMLNode<"text", string, null>;
  type HTMLFontStyleNode = IHTMLNode<"fontStyle", string | Array<HTMLNode>, SupportedFontStyleTag>;
  type HTMLParagraphNode = IHTMLNode<"paragraph", string | Array<HTMLNode>, SupportedParagraphTag>;
  type HTMLHeadingNode = IHTMLNode<"header", string | Array<HTMLNode>, SupportedHeaderTag>;

  type HTMLNode = HTMLTextNode | HTMLParagraphNode | HTMLHeadingNode | HTMLFontStyleNode;

  type SupportedFontStyle = { name: FontStyleName; tag: SupportedFontStyleTag };

  type Font = {
    readonly src: string;
    readonly fontWeight: Style.FontWeight;
    readonly fontStyle?: "italic";
  };

  type DocumentLoadedParams = {
    readonly numPages: number;
  };

  type DocumentProps = import("@react-pdf/renderer").default.DocumentProps & { children: JSX.Element | JSX.Element[] };

  type PageRenderParams = {
    readonly pageNumber: number;
  };

  type RenderDocumentProps = {
    readonly title?: string;
    readonly file?: string | ArrayBuffer | null;
    readonly loading?: boolean;
    readonly onLoadSuccess?: (params: DocumentLoadedParams) => void;
    readonly onLoadError?: (error: Error) => void;
    readonly onLoadStarted?: () => void;
    readonly children: JSX.Element;
    readonly loadingOnNoFile?: boolean;
  };

  type IPreviewerExportParams = {
    readonly filename?: string;
    readonly component?: JSX.Element;
    readonly onSuccess?: () => void;
  };

  type NoDataDocumentProps = Pdf.StandardComponentProps & {
    readonly size?: import("@react-pdf/types").PageSize;
    readonly debug?: boolean;
    readonly text?: string | boolean;
  };

  type IPreviewerRef = {
    readonly render: (component?: JSX.Element) => void;
    readonly renderEmptyDocument: (props?: NoDataDocumentProps) => void;
    readonly debouncedRender: () => void;
    readonly export: (params: IPreviewerExportParams) => void;
    readonly refreshRequired: () => void;
  };
}

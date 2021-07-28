/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace RichText {
  type BlockType = "paragraph" | "header" | "list";

  type GenericBlock<T extends RichText.BlockType, D extends object = any> = import("@editorjs/editorjs").OutputBlockData<T, D>;

  type TextFragment = { text?: string, styles?: Pdf.FontStyleName[], children?: TextFragment[] }

  // Note that we add additional style properties to the paragraph block here, and compute them
  // in a component that wraps EditorJS.  EditorJS does not include the fields other than `text`
  // by default.
  type ParagraphBlock = RichText.GenericBlock<"paragraph", RichText.TextFragment>;
  type HeadingBlock = RichText.GenericBlock<"header", RichText.TextFragment & { level: Pdf.HeadingLevel}>;

  type ListBlockStyle = "orderered" | "unordered";
  type ListBlockData = { items: string[], style: RichText.ListBlockStyle };
  type ListBlock = RichText.GenericBlock<"list", RichText.ListBlockData>;

  type Block = ListBlock | ParagraphBlock | HeadingBlock;
}

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Pdf {
  type FontFamily = "OpenSans" | "Roboto";
  type FontWeight = "Bold" | "Regular" | "Light" | "SemiBold" | "Medium";
  type FontStyleName = "italic" | "bold";
  type FontStyleTag = "i" | "b";
  type SupportedFontStyle = { name: Pdf.FontStyleName, tag: Pdf.FontStyleTag };

  type FontVariant = Pdf.FontWeight | { weight: Pdf.FontWeight; style: "italic" };
  type Font = { family: Pdf.FontFamily; variants: Pdf.FontVariant[] };

  type Style = import("@react-pdf/types").Style;
  type Styles = import("@react-pdf/renderer").default.Styles;

  type ExtensionStyle = ReactPdfStyle & { ext?: SingleOrArray<string>, fontFamily?: Pdf.FontFamily };
  type ExtensionStyles = {[key: string]: Pdf.InternalStyle};

  type HeadingLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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
    readonly loading?: JSX.Element;
    readonly onLoadSuccess?: (params: DocumentLoadedParams) => void;
    readonly children: JSX.Element;
    readonly loadingOnNoFile?: boolean;
  }
}
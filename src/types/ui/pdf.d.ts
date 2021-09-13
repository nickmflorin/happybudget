/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace RichText {
  type BlockType = "paragraph" | "header" | "list";

  type GenericBlock<T extends RichText.BlockType, D extends object = any> = import("@editorjs/editorjs").OutputBlockData<T, D>;

  type TextFragment = { text: string; styles?: FontStyleName[] };
  type TextFragmentGroup = { data: TextData };
  type TextDataElement = TextFragment | TextFragmentGroup
  type TextData = TextDataElement[];

  // Note that these blocks are different from the EditorJS blocks.  This is because
  // we need to layer on additional functionality, and we need to model them more appropriately
  // to work with a seamless backend/API.
  type ParagraphBlock = {
    readonly type: "paragraph";
    readonly data: RichText.TextData;
  }

  type HeadingBlock = {
    readonly type: "header";
    readonly data: RichText.TextData;
    readonly level: Pdf.HeadingLevel;
  }

  type ListBlockConfiguration = "orderered" | "unordered";
  type ListBlock = {
    readonly type: "list";
    readonly items: string[];
    readonly configuration: RichText.ListBlockConfiguration;

  }

  type Block = ListBlock | ParagraphBlock | HeadingBlock;
}

/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Pdf {
  type Style = import("@react-pdf/types").Style;
  type Styles = import("@react-pdf/renderer").default.Styles;

  type ExtensionStyle = ReactPdfStyle & { ext?: SingleOrArray<string>, fontFamily?: FontFamily };
  type ExtensionStyles = {[key: string]: Pdf.ExtensionStyle};

  type FontStyleName = "italic" | "bold";
  type FontStyleTag = "i" | "b";
  type SupportedFontStyle = { name: FontStyleName, tag: FontStyleTag };
  type Font = {
    readonly src: any;
    readonly fontWeight: FontWeight;
    readonly fontStyle?: "italic";
  };

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
    readonly loading?: boolean;
    readonly onLoadSuccess?: (params: DocumentLoadedParams) => void;
    readonly onLoadError?: (error: Error) => void;
    readonly onLoadStarted?: () => void;
    readonly children: JSX.Element;
    readonly loadingOnNoFile?: boolean;
  }
}
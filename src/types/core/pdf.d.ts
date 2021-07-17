/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace Pdf {
  type TextStyle = "italic" | "bold";
  type HeadingLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

  type DocumentLoadedParams = {
    readonly numPages: number;
  }

  type DocumentProps = import("@react-pdf/renderer").default.DocumentProps & {children: JSX.Element | JSX.Element[]};

  type PageRenderParams = {
    readonly pageNumber: number;
  }
  type RenderCallback = () => JSX.Element | RichText.Block[];
  type PageRenderCallback = (params: Pdf.PageRenderParams) => JSX.Element | RichText.Block[];
  type ElementBlocksOrCallback = Pdf.PageRenderCallback | JSX.Element | RichText.Block[];

  type RenderDocumentProps = {
    readonly title?: string;
    readonly file?: string | ArrayBuffer | null;
    readonly loading?: JSX.Element;
    readonly onLoadSuccess?: (params: DocumentLoadedParams) => void;
    readonly children: JSX.Element;
    readonly loadingOnNoFile?: boolean;
  }
}
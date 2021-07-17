/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace RichText {
  type BlockType = "paragraph" | "header" | "list";

  type GenericBlock<T extends RichText.BlockType, D extends object = any> = import("@editorjs/editorjs").OutputBlockData<T, D>;

  type TextFragment = { text?: string, styles?: Pdf.TextStyle[], children?: TextFragment[] }

  // Note that we add additional style properties to the paragraph block here, and compute them
  // in a component that wraps EditorJS.  EditorJS does not include the fields other than `text`
  // by default.
  type ParagraphBlock = RichText.GenericBlock<"paragraph", RichText.TextFragment>;

  type HeadingBlockData = { text: string, level: Pdf.HeadingLevel };
  type HeadingBlock = RichText.GenericBlock<"header", RichText.HeadingBlockData>;

  type ListBlockStyle = "orderered" | "unordered";
  type ListBlockData = { items: string[], style: RichText.ListBlockStyle };
  type ListBlock = RichText.GenericBlock<"list", RichText.ListBlockData>;

  type Block = ListBlock | ParagraphBlock | HeadingBlock;
}
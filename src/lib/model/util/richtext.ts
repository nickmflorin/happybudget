import { isNil, includes, map, reduce } from "lodash";
import { OutputBlockData } from "@editorjs/editorjs";
import { SupportedPdfFontStyles } from "lib/model";
import * as typeguards from "lib/model/typeguards";

export const convertTagsToFontStyles = (tags: Pdf.FontStyleTag[]): Pdf.FontStyleName[] => {
  return reduce(
    SupportedPdfFontStyles,
    (names: Pdf.FontStyleName[], style: Pdf.SupportedFontStyle) => {
      if (includes(tags, style.tag)) {
        return [...names, style.name];
      }
      return names;
    },
    []
  );
};

export const convertFontStylesToTags = (names: Pdf.FontStyleName[]): Pdf.FontStyleTag[] => {
  return reduce(
    SupportedPdfFontStyles,
    (tags: Pdf.FontStyleTag[], style: Pdf.SupportedFontStyle) => {
      if (includes(names, style.name)) {
        return [...tags, style.tag];
      }
      return tags;
    },
    []
  );
};

export const wrapTextInFontStyleTags = (text: string, names: Pdf.FontStyleName[]): string => {
  const tags = convertFontStylesToTags(names);
  return reduce(
    tags,
    (current: string, tag: Pdf.FontStyleTag) => {
      return `<${tag}>${current}</${tag}>`;
    },
    text
  );
};

export const convertHtmlIntoTextBlock = (html: string): RichText.TextBlock | null => {
  let doc = new DOMParser().parseFromString(html, "text/html");
  let element = doc.body;

  const convertNodeIntoTextBlock = (el: ChildNode, tags?: Pdf.FontStyleTag[]): RichText.TextBlock | null => {
    const supportedTags: Pdf.FontStyleTag[] = map(SupportedPdfFontStyles, (style: Pdf.SupportedFontStyle) => style.tag);

    tags = tags || [];
    if (el.nodeType === 3) {
      const text = el.nodeValue;
      if (!isNil(text)) {
        return {
          text,
          styles: convertTagsToFontStyles(tags)
        };
      }
      return null;
    } else if (el.childNodes.length === 1) {
      const tag = el.nodeName.toLowerCase();
      if (includes(supportedTags, tag)) {
        tags = [...tags, tag as Pdf.FontStyleTag];
      }
      return convertNodeIntoTextBlock(el.childNodes[0], tags);
    } else {
      const tag = el.nodeName.toLowerCase();
      if (includes(supportedTags, tag)) {
        tags = [...tags, tag as Pdf.FontStyleTag];
      }
      const children: RichText.TextBlock[] = reduce(
        el.childNodes,
        (current: RichText.TextBlock[], node: ChildNode) => {
          const block: RichText.TextBlock | null = convertNodeIntoTextBlock(node, tags);
          if (!isNil(block)) {
            return [...current, block];
          }
          return current;
        },
        []
      );
      return children.length !== 0 ? { blocks: children } : null;
    }
  };

  let blocks: RichText.TextBlock[] = reduce(
    element.childNodes,
    (bs: RichText.TextBlock[], child: ChildNode) => {
      const block = convertNodeIntoTextBlock(child);
      if (!isNil(block)) {
        return [...bs, block];
      }
      return bs;
    },
    []
  );
  if (blocks.length === 0) {
    return null;
  } else if (blocks.length === 1) {
    return blocks[0];
  }
  return { blocks };
};

export const convertTextBlockIntoHtml = (block: RichText.TextBlock): string => {
  if (typeguards.isTextFragment(block)) {
    return !isNil(block.styles) ? wrapTextInFontStyleTags(block.text, block.styles) : block.text;
  } else {
    return reduce(
      block.blocks,
      (current: string, subblock: RichText.TextBlock) => {
        return current + convertTextBlockIntoHtml(subblock);
      },
      ""
    );
  }
};

type EditorJSBlockConverter<T extends string, D extends object = any> = (
  original: OutputBlockData<T, D>
) => RichText.Block | null;

/* eslint-disable no-unused-vars */
const BlockTypeConverters: { [key in RichText.BlockType]: EditorJSBlockConverter<any> } = {
  list: (original: OutputBlockData<"list", { items: string[]; style: RichText.ListBlockConfiguration }>) => ({
    type: "list",
    items: original.data.items,
    configuration: original.data.style
  }),
  header: (original: OutputBlockData<"header", { text: string; level: number }>): RichText.HeadingBlock | null => {
    const block = convertHtmlIntoTextBlock(original.data.text);
    if (!isNil(block)) {
      if (!includes([1, 2, 3, 4, 5, 6], original.data.level)) {
        /* eslint-disable no-console */
        console.error(`Unsupported heading level ${original.data.level}!`);
        return { type: "header", level: 2, data: block };
      }
      return {
        type: "header",
        level: original.data.level as Pdf.HeadingLevel,
        data: block
      };
    } else {
      /* eslint-disable no-console */
      console.error(`Could not convert heading block text ${original.data.text} into internal block.`);
      return null;
    }
  },
  paragraph: (original: OutputBlockData<"paragraph", { text: string }>): RichText.ParagraphBlock | null => {
    const block = convertHtmlIntoTextBlock(original.data.text);
    if (!isNil(block)) {
      return {
        type: "paragraph",
        data: block
      };
    } else {
      /* eslint-disable no-console */
      console.error(`Could not convert paragraph block text ${original.data.text} into internal block.`);
      return null;
    }
  }
};

export const convertEditorJSBlocksToInternalBlocks = (blocks: OutputBlockData[]): RichText.Block[] => {
  return reduce(
    blocks,
    (outputData: RichText.Block[], block: OutputBlockData) => {
      if (isNil(BlockTypeConverters[block.type as RichText.BlockType])) {
        /* eslint-disable no-console */
        console.error(`Unsupported block type ${block.type}!`);
        return outputData;
      } else {
        const converted: RichText.Block | null = BlockTypeConverters[block.type as RichText.BlockType](block);
        if (!isNil(converted)) {
          return [...outputData, converted];
        }
        return outputData;
      }
    },
    []
  );
};

type InverseEditorJSBlockConverter<B extends RichText.Block, T extends string, D extends object = any> = (
  internal: B
) => OutputBlockData<T, D>;

const InverseBlockTypeConverters: { [key in RichText.BlockType]: InverseEditorJSBlockConverter<any, any> } = {
  list: (
    internal: RichText.ListBlock
  ): OutputBlockData<"list", { items: string[]; style: RichText.ListBlockConfiguration }> => ({
    type: "list",
    data: {
      items: internal.items,
      style: internal.configuration
    }
  }),
  header: (internal: RichText.HeadingBlock): OutputBlockData<"header", { text: string; level: number }> => ({
    type: "header",
    data: {
      level: internal.level,
      text: convertTextBlockIntoHtml(internal.data)
    }
  }),
  paragraph: (internal: RichText.ParagraphBlock): OutputBlockData<"paragraph", { text: string }> => ({
    type: "paragraph",
    data: {
      text: convertTextBlockIntoHtml(internal.data)
    }
  })
};

export const convertInternalBlocksToEditorJSBlocks = (blocks: RichText.Block[]): OutputBlockData[] => {
  return reduce(
    blocks,
    (outputData: OutputBlockData[], block: RichText.Block) => {
      if (isNil(InverseBlockTypeConverters[block.type as RichText.BlockType])) {
        /* eslint-disable no-console */
        console.error(`Unsupported block type ${block.type}!`);
        return outputData;
      } else {
        return [...outputData, InverseBlockTypeConverters[block.type as RichText.BlockType](block)];
      }
    },
    []
  );
};

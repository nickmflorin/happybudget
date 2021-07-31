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

export const convertHtmlIntoTextData = (html: string): RichText.TextData | null => {
  let doc = new DOMParser().parseFromString(html, "text/html");
  let element = doc.body;

  const convertNodeIntoTextDataElement = (
    el: ChildNode,
    tags?: Pdf.FontStyleTag[]
  ): RichText.TextDataElement | null => {
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
      return convertNodeIntoTextDataElement(el.childNodes[0], tags);
    } else {
      const tag = el.nodeName.toLowerCase();
      if (includes(supportedTags, tag)) {
        tags = [...tags, tag as Pdf.FontStyleTag];
      }
      const children: RichText.TextDataElement[] = reduce(
        el.childNodes,
        (current: RichText.TextDataElement[], node: ChildNode) => {
          const textElement: RichText.TextDataElement | null = convertNodeIntoTextDataElement(node, tags);
          if (!isNil(textElement)) {
            return [...current, textElement];
          }
          return current;
        },
        []
      );
      return children.length !== 0 ? { data: children } : null;
    }
  };

  let data: RichText.TextDataElement[] = reduce(
    element.childNodes,
    (bs: RichText.TextDataElement[], child: ChildNode) => {
      const block = convertNodeIntoTextDataElement(child);
      if (!isNil(block)) {
        return [...bs, block];
      }
      return bs;
    },
    []
  );
  if (data.length === 0) {
    return null;
  }
  return data;
};

export const convertTextElementIntoHtml = (element: RichText.TextDataElement): string => {
  if (typeguards.isTextFragment(element)) {
    return !isNil(element.styles) ? wrapTextInFontStyleTags(element.text, element.styles) : element.text;
  } else {
    return reduce(
      element.data,
      (c: string, subElement: RichText.TextDataElement) => {
        return c + convertTextElementIntoHtml(subElement);
      },
      ""
    );
  }
};

export const convertTextDataIntoHtml = (data: RichText.TextData): string =>
  reduce(
    data,
    (current: string, element: RichText.TextDataElement) => current + convertTextElementIntoHtml(element),
    ""
  );

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
    const textData = convertHtmlIntoTextData(original.data.text);
    if (!isNil(textData)) {
      if (!includes([1, 2, 3, 4, 5, 6], original.data.level)) {
        /* eslint-disable no-console */
        console.error(`Unsupported heading level ${original.data.level}!`);
        return { type: "header", level: 2, data: textData };
      }
      return {
        type: "header",
        level: original.data.level as Pdf.HeadingLevel,
        data: textData
      };
    } else {
      /* eslint-disable no-console */
      console.error(`Could not convert heading block text ${original.data.text} into internal block.`);
      return null;
    }
  },
  paragraph: (original: OutputBlockData<"paragraph", { text: string }>): RichText.ParagraphBlock | null => {
    const textData = convertHtmlIntoTextData(original.data.text);
    if (!isNil(textData)) {
      return {
        type: "paragraph",
        data: textData
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
      text: convertTextDataIntoHtml(internal.data)
    }
  }),
  paragraph: (internal: RichText.ParagraphBlock): OutputBlockData<"paragraph", { text: string }> => ({
    type: "paragraph",
    data: {
      text: convertTextDataIntoHtml(internal.data)
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

import { isNil, includes, map, filter, reduce } from "lodash";
import { OutputBlockData } from "@editorjs/editorjs";
import { SupportedPdfFontStyles } from "lib/model";

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

export const convertHtmlIntoTextFragments = (html: string): RichText.TextFragment[] => {
  let doc = new DOMParser().parseFromString(html, "text/html");
  let element = doc.body;

  const createTextFragmentFromNode = (el: ChildNode, tags?: Pdf.FontStyleTag[]): RichText.TextFragment | null => {
    const supportedTags: Pdf.FontStyleTag[] = map(SupportedPdfFontStyles, (style: Pdf.SupportedFontStyle) => style.tag);

    tags = tags || [];
    if (el.nodeType === 3) {
      const text = el.nodeValue;
      if (!isNil(text)) {
        return { text, styles: !isNil(tags) ? convertTagsToFontStyles(tags) : [] };
      }
      return null;
    } else if (el.childNodes.length === 1) {
      const tag = el.nodeName.toLowerCase();
      if (includes(supportedTags, tag)) {
        return createTextFragmentFromNode(el.childNodes[0], [...tags, tag as Pdf.FontStyleTag]);
      }
      return createTextFragmentFromNode(el.childNodes[0], tags);
    } else {
      return {
        fragments: filter(
          map(el.childNodes, (child: ChildNode) => {
            const tag = el.nodeName.toLowerCase();
            if (includes(supportedTags, tag)) {
              return createTextFragmentFromNode(child, [...(tags || []), tag as Pdf.FontStyleTag]);
            }
            return createTextFragmentFromNode(child, tags);
          }),
          (child: RichText.TextFragment | null) => !isNil(child)
        ) as RichText.TextFragment[]
      };
    }
  };

  let fragments: RichText.TextFragment[] = [];
  for (let i = 0; i < element.childNodes.length; i++) {
    const fragment = createTextFragmentFromNode(element.childNodes[i]);
    if (!isNil(fragment)) {
      fragments.push(fragment);
    }
  }

  return fragments;
};

export const convertTextFragmentIntoHtml = (fragment: RichText.TextFragment): string => {
  let text = fragment.text || "";
  if (!isNil(fragment.fragments)) {
    text = reduce(
      fragment.fragments,
      (current: string, child: RichText.TextFragment) => {
        return current + convertTextFragmentIntoHtml(child);
      },
      text
    );
  }
  return !isNil(fragment.styles) ? wrapTextInFontStyleTags(text, fragment.styles) : text;
};

export const convertTextFragmentsIntoHtml = (fragments: RichText.TextFragment[]): string => {
  return reduce(
    fragments,
    (text: string, fragment: RichText.TextFragment) => {
      return text + convertTextFragmentIntoHtml(fragment);
    },
    ""
  );
};

type EditorJSBlockConverter<T extends string, D extends object = any> = (
  original: OutputBlockData<T, D>
) => RichText.Block;

/* eslint-disable no-unused-vars */
const BlockTypeConverters: { [key in RichText.BlockType]: EditorJSBlockConverter<any> } = {
  list: (original: OutputBlockData<"list", { items: string[]; style: RichText.ListBlockConfiguration }>) => ({
    type: "list",
    items: original.data.items,
    configuration: original.data.style
  }),
  header: (original: OutputBlockData<"header", { text: string; level: number }>): RichText.HeadingBlock => {
    const fragments = convertHtmlIntoTextFragments(original.data.text);
    if (!includes([1, 2, 3, 4, 5, 6], original.data.level)) {
      /* eslint-disable no-console */
      console.error(`Unsupported heading level ${original.data.level}!`);
      return { type: "header", level: 2, fragments };
    }
    return {
      type: "header",
      level: original.data.level as Pdf.HeadingLevel,
      fragments
    };
  },
  paragraph: (original: OutputBlockData<"paragraph", { text: string }>): RichText.ParagraphBlock => {
    const fragments = convertHtmlIntoTextFragments(original.data.text);
    return {
      type: "paragraph",
      fragments
    };
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
        return [...outputData, BlockTypeConverters[block.type as RichText.BlockType](block)];
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
      text: convertTextFragmentsIntoHtml(internal.fragments)
    }
  }),
  paragraph: (internal: RichText.ParagraphBlock): OutputBlockData<"paragraph", { text: string }> => ({
    type: "paragraph",
    data: {
      text: convertTextFragmentsIntoHtml(internal.fragments)
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

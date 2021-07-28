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
        children: filter(
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
  if (!isNil(fragment.children)) {
    text = reduce(
      fragment.children,
      (current: string, child: RichText.TextFragment) => {
        return current + convertTextFragmentIntoHtml(child);
      },
      text
    );
  }
  return !isNil(fragment.styles) ? wrapTextInFontStyleTags(text, fragment.styles) : text;
};

type EditorJSBlockConverter<T extends string, D extends object = any> = (
  original: OutputBlockData<T, D>
) => RichText.Block;

const IdentityConverter = <B extends RichText.Block>(original: OutputBlockData): B => ({ ...original } as B);

/* eslint-disable no-unused-vars */
const BlockTypeConverters: { [key in RichText.BlockType]: EditorJSBlockConverter<any> } = {
  list: IdentityConverter,
  header: (original: OutputBlockData<"header", { text: string; level: number }>): RichText.HeadingBlock => {
    const fragments = convertHtmlIntoTextFragments(original.data.text);
    return {
      ...original,
      data:
        fragments.length === 0
          ? { ...fragments[0], level: original.data.level as Pdf.HeadingLevel }
          : { children: fragments, level: original.data.level as Pdf.HeadingLevel }
    };
  },
  paragraph: (original: OutputBlockData<"paragraph", { text: string }>): RichText.ParagraphBlock => {
    const fragments = convertHtmlIntoTextFragments(original.data.text);
    return {
      ...original,
      data: fragments.length === 0 ? fragments[0] : { children: fragments }
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

const InverseIdentityConverter = <B extends RichText.Block>(internal: B): OutputBlockData =>
  ({ ...internal } as OutputBlockData);

const InverseBlockTypeConverters: { [key in RichText.BlockType]: InverseEditorJSBlockConverter<any, any> } = {
  list: InverseIdentityConverter,
  header: (internal: RichText.HeadingBlock): OutputBlockData<"header", { text: string; level: number }> => ({
    ...internal,
    data: {
      ...internal.data,
      text: convertTextFragmentIntoHtml({
        text: internal.data.text,
        children: internal.data.children,
        styles: internal.data.styles
      })
    }
  }),
  paragraph: (internal: RichText.ParagraphBlock): OutputBlockData<"paragraph", { text: string }> => ({
    ...internal,
    data: {
      ...internal.data,
      text: convertTextFragmentIntoHtml({
        text: internal.data.text,
        children: internal.data.children,
        styles: internal.data.styles
      })
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

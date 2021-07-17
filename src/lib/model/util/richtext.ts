import { isNil, includes, map, filter } from "lodash";

const convertTagsToStyles = (tags: string[]): Pdf.TextStyle[] => {
  const styles: Pdf.TextStyle[] = [];
  if (includes(tags, "b")) {
    styles.push("bold");
  }
  if (includes(tags, "i")) {
    styles.push("italic");
  }
  return styles;
};

const partitionElement = (el: ChildNode, tags?: string[]): RichText.TextFragment | null => {
  tags = tags || [];
  if (el.nodeType === 3) {
    const text = el.nodeValue;
    if (!isNil(text)) {
      return { text, styles: !isNil(tags) ? convertTagsToStyles(tags) : [] };
    }
    return null;
  } else if (el.childNodes.length === 1) {
    return partitionElement(el.childNodes[0], [...tags, el.nodeName.toLowerCase()]);
  } else {
    return {
      children: filter(
        map(el.childNodes, (child: ChildNode) => partitionElement(child, [...(tags || []), el.nodeName.toLowerCase()])),
        (child: RichText.TextFragment | null) => !isNil(child)
      ) as RichText.TextFragment[]
    };
  }
};

export const partitionHtmlIntoFragments = (html: string): RichText.TextFragment[] => {
  let doc = new DOMParser().parseFromString(html, "text/html");
  let element = doc.body;

  let fragments: RichText.TextFragment[] = [];
  for (let i = 0; i < element.childNodes.length; i++) {
    const fragment = partitionElement(element.childNodes[i]);
    if (!isNil(fragment)) {
      fragments.push(fragment);
    }
  }

  return fragments;
};

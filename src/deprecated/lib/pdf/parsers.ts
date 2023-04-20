import { isNil, includes, reduce, map, uniq, filter } from "lodash";

import * as typeguards from "./typeguards";

export const convertTagsToFontStyles = (tags: Pdf.SupportedFontStyleTag[]): Pdf.FontStyleName[] =>
  reduce(
    typeguards.SupportedPdfFontStyles,
    (names: Pdf.FontStyleName[], style: Pdf.SupportedFontStyle) => {
      if (includes(tags, style.tag)) {
        return uniq([...names, style.name]);
      }
      return names;
    },
    [],
  );

export const cleanText = (text: string) => text.replace("\n", "").trim();

export const removeWhitespace = (node: Node) => {
  for (let i = node.childNodes.length; i-- > 0; ) {
    const child = node.childNodes[i];
    if (!isNil(child.nodeValue) && child.nodeType === 3 && /^\s*$/.exec(child.nodeValue)) {
      node.removeChild(child);
    }
    if (child.nodeType === 1) {
      removeWhitespace(child);
    }
  }
};

export const isSupportedNode = (node: Node): boolean => {
  if (node.nodeType !== node.ELEMENT_NODE) {
    throw new Error("Node is not an element node!");
  }
  return typeguards.isSupportedTag(node.nodeName);
};

export const removeUnsupportedNodes = (element: Node): Node[] => {
  const _prune = (node: Node) => {
    if (node.nodeType === node.ELEMENT_NODE) {
      const newNodes: Node[] = reduce(
        node.childNodes,
        (curr: Node[], child: Node) => {
          _prune(child);
          if (child.childNodes.length !== 0) {
            if (child.nodeType === node.ELEMENT_NODE && !isSupportedNode(child)) {
              if (child.childNodes.length !== 0) {
                return [
                  ...curr,
                  ...filter(
                    child.childNodes,
                    (n: Node) => n.nodeType !== Node.ELEMENT_NODE || n.childNodes.length !== 0,
                  ),
                ];
              } else if (child.nodeType === Node.TEXT_NODE) {
                return [...curr, child];
              }
              return curr;
            }
            return [...curr, child];
          } else if (child.nodeType === Node.TEXT_NODE) {
            return [...curr, child];
          }
          return curr;
        },
        [],
      );
      node.childNodes.forEach((child: Node) => node.removeChild(child));
      map(Array.isArray(newNodes) ? newNodes : [newNodes], (child: Node) =>
        node.appendChild(child),
      );
    }
  };
  _prune(element);
  if (element.nodeType === element.ELEMENT_NODE && isSupportedNode(element)) {
    return [element];
  }
  return map(element.childNodes, (n: Node) => n);
};

export const structuredNodeType = (node: Node): Pdf.HTMLNodeType | null => {
  if (node.nodeType === Node.TEXT_NODE) {
    return "text";
  } else {
    const tag = node.nodeName.toLocaleLowerCase() as Pdf.SupportedHTMLTag;
    if (typeguards.isParagraphTag(tag)) {
      return "paragraph";
    } else if (typeguards.isHeaderTag(tag)) {
      return "header";
    } else if (typeguards.isFontStyleTag(tag)) {
      return "fontStyle";
    } else {
      console.error(`Encountered unrecognized tag ${tag as string} while parsing HTML node.`);
      return null;
    }
  }
};

export const structureNode = (node: Node): Pdf.HTMLNode[] => {
  const supported: Node[] = removeUnsupportedNodes(node);

  const structure = (n: Node): Pdf.HTMLNode | null => {
    if (n.nodeType === Node.TEXT_NODE) {
      const text = n.nodeValue;
      if (!isNil(text)) {
        return {
          data: cleanText(text),
          type: "text",
          tag: null,
        };
      }
      return null;
    } else if (n.nodeType === Node.ELEMENT_NODE) {
      if (!isSupportedNode(n)) {
        console.warn(`Suspicious Behavior: Unsupported node ${n.nodeName} found!`);
        return null;
      } else if (n.childNodes.length === 0) {
        // This can often happen if there is no text inside of the node.
        return null;
      } else {
        const tag = n.nodeName.toLocaleLowerCase() as Pdf.SupportedHTMLTag;
        if (n.childNodes.length === 1 && n.childNodes[0].nodeType === Node.TEXT_NODE) {
          const nodeValue = n.childNodes[0].nodeValue;
          if (isNil(nodeValue) || nodeValue.trim() === "") {
            return null;
          }
          const nodeType = structuredNodeType(n);
          if (nodeType == null) {
            return null;
          }
          return {
            tag,
            type: nodeType,
            data: nodeValue,
          } as Pdf.HTMLNode;
        }
        const children = filter(
          map(n.childNodes, (ni: Node) => structure(ni)),
          (ni: Pdf.HTMLNode | null) => !isNil(ni),
        ) as Pdf.HTMLNode[];

        // This can often happen if there is no text inside of the node.
        if (children.length === 0) {
          return null;
        }
        const nodeType = structuredNodeType(n);
        if (nodeType == null) {
          return null;
        }
        return { tag, type: nodeType, data: children } as Pdf.HTMLNode;
      }
    } else {
      console.warn(`Suspicious Behavior: Unsupported node type ${n.nodeType} found!`);
      return null;
    }
  };
  return reduce(
    supported,
    (curr: Pdf.HTMLNode[], n: Node) => {
      const internal = structure(n);
      if (!isNil(internal)) {
        return [...curr, internal];
      }
      return [...curr];
    },
    [],
  );
};

export const convertHtmlIntoDoc = (html: string): Node => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const element = doc.body;
  removeWhitespace(element);
  return element;
};

export const convertHtmlIntoNodes = (html: string): Pdf.HTMLNode[] =>
  structureNode(convertHtmlIntoDoc(html));

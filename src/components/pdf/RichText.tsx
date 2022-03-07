import { isNil, map, filter } from "lodash";

import { pdf } from "lib";

import { View } from "./primitive";
import { Text, Paragraph, Heading } from "./text";

interface RichTextNodeProps extends Pdf.StandardComponentProps {
  readonly node: Pdf.HTMLNode;
  readonly styles?: Pdf.FontStyleName[];
}

const RichTextNode = ({ node, ...props }: RichTextNodeProps): JSX.Element => {
  if (pdf.typeguards.isParagraphNode(node) || pdf.typeguards.isTextNode(node)) {
    if (typeof node.data === "string") {
      return <Paragraph {...props}>{node.data}</Paragraph>;
    } else {
      return (
        <Paragraph {...props}>
          {map(node.data, (n: Pdf.HTMLNode, index: number) => (
            <RichTextNode key={index} node={n} />
          ))}
        </Paragraph>
      );
    }
  } else if (pdf.typeguards.isHeadingNode(node)) {
    const level = parseInt(node.tag[1]) as Pdf.HeadingLevel;
    if (!isNaN(level)) {
      if (typeof node.data === "string") {
        return (
          <Heading {...props} level={level}>
            {node.data}
          </Heading>
        );
      } else {
        return (
          <Heading level={level} {...props}>
            {map(node.data, (n: Pdf.HTMLNode, index: number) => (
              <RichTextNode key={index} node={n} />
            ))}
          </Heading>
        );
      }
    } else {
      console.warn(`Corrupted heading tag ${node.tag} found!`);
      return <></>;
    }
  } else {
    if (typeof node.data === "string") {
      return (
        <Text {...props} styles={[...(props.styles || []), ...pdf.parsers.convertTagsToFontStyles([node.tag])]}>
          {node.data}
        </Text>
      );
    } else {
      return (
        <Text {...props} styles={[...(props.styles || []), ...pdf.parsers.convertTagsToFontStyles([node.tag])]}>
          {map(node.data, (n: Pdf.HTMLNode, index: number) => (
            <RichTextNode key={index} node={n} />
          ))}
        </Text>
      );
    }
  }
};

interface RichTextProps extends Pdf.StandardComponentProps {
  readonly nodes: Pdf.HTMLNode[] | Pdf.HTMLNode;
}

const RichText = ({ nodes, ...props }: RichTextProps): JSX.Element => (
  <View {...props}>
    {filter(
      map(Array.isArray(nodes) ? nodes : [nodes], (node: Pdf.HTMLNode, index: number): JSX.Element | null => (
        <RichTextNode key={index} node={node} />
      )),
      (element: JSX.Element | null) => !isNil(element)
    )}
  </View>
);

export default RichText;

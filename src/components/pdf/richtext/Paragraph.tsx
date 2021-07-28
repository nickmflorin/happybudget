import { TextProps } from "../text/Text";
import RichTextFragment from "./ParagraphFragment";

interface RichTextParagraphProps extends TextProps {
  readonly block: RichText.ParagraphBlock;
}

const RichTextParagraph = ({ block, ...props }: RichTextParagraphProps): JSX.Element => (
  <RichTextFragment fragment={block.data} {...props} />
);

export default RichTextParagraph;

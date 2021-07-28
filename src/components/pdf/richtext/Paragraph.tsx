import Paragraph, { ParagraphProps } from "../text/Paragraph";
import { RichTextParagraphFragments } from "./ParagraphFragment";

interface RichTextParagraphProps extends ParagraphProps {
  readonly block: RichText.ParagraphBlock;
}

const RichTextParagraph = ({ block, ...props }: RichTextParagraphProps): JSX.Element => (
  <Paragraph>
    <RichTextParagraphFragments fragments={block.fragments} {...props} />
  </Paragraph>
);

export default RichTextParagraph;

import { TextProps } from "../primitive/Text";

import RichTextFragment from "./Fragment";

interface RichTextParagraphProps extends TextProps {
  readonly block: RichText.ParagraphBlock;
}

const RichTextParagraph = ({ block, ...props }: RichTextParagraphProps): JSX.Element => (
  <RichTextFragment fragment={block.data} {...props} />
);

export default RichTextParagraph;

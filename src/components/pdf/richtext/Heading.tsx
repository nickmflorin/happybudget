import { Heading } from "../text";
import { HeadingProps } from "../text/Heading";

interface RichTextHeadingProps extends Omit<HeadingProps, "level"> {
  readonly block: RichText.HeadingBlock;
}

const RichTextHeading = ({ block, ...props }: RichTextHeadingProps): JSX.Element => (
  <Heading {...props} level={block.data.level}>
    {block.data.text}
  </Heading>
);

export default RichTextHeading;

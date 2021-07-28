import Heading, { HeadingProps } from "../text/Heading";
import { RichTextHeadingFragments } from "./HeadingFragment";

interface RichTextHeadingProps extends Omit<HeadingProps, "level"> {
  readonly block: RichText.HeadingBlock;
}
const RichTextHeading = ({ block, ...props }: RichTextHeadingProps): JSX.Element => (
  <Heading {...props} level={block.level}>
    <RichTextHeadingFragments fragments={block.fragments} level={block.level} {...props} />
  </Heading>
);

export default RichTextHeading;

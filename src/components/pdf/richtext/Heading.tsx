import { HeadingProps } from "../text/Heading";
import RichHeadingFragment from "./HeadingFragment";

interface RichTextHeadingProps extends Omit<HeadingProps, "level"> {
  readonly block: RichText.HeadingBlock;
}
const RichTextHeading = ({ block, ...props }: RichTextHeadingProps): JSX.Element => (
  <RichHeadingFragment fragment={block.data} level={block.data.level} {...props} />
);

export default RichTextHeading;

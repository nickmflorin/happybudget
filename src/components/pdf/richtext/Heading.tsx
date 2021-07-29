import * as typeguards from "lib/model/typeguards";
import { map } from "lodash";

import Heading, { HeadingProps } from "../text/Heading";

interface HeadingTextBlockProps extends HeadingProps {
  readonly block: RichText.TextBlock;
}

const HeadingTextBlock = ({ block, ...props }: HeadingTextBlockProps): JSX.Element => (
  <Heading {...props} styles={typeguards.isTextFragment(block) ? block.styles : []}>
    {typeguards.isTextFragment(block)
      ? /* eslint-disable indent */
        block.text
      : map(block.blocks, (subBlock: RichText.TextBlock, index: number) => (
          <HeadingTextBlock key={index} {...props} block={subBlock} />
        ))}
  </Heading>
);

interface RichTextHeadingProps extends Omit<HeadingProps, "level"> {
  readonly block: RichText.HeadingBlock;
}

const RichTextHeading = ({ block, ...props }: RichTextHeadingProps): JSX.Element => (
  <Heading {...props} level={block.level} styles={typeguards.isTextFragment(block.data) ? block.data.styles : []}>
    {typeguards.isTextFragment(block.data)
      ? block.data.text
      : map(block.data.blocks, (subBlock: RichText.TextBlock, index: number) => (
          <HeadingTextBlock {...props} key={index} level={block.level} block={subBlock} />
        ))}
  </Heading>
);

export default RichTextHeading;

import * as typeguards from "lib/model/typeguards";
import { map } from "lodash";

import Paragraph, { ParagraphProps } from "../text/Paragraph";

interface ParagraphTextBlockProps extends ParagraphProps {
  readonly block: RichText.TextBlock;
}

const ParagraphTextBlock = ({ block, ...props }: ParagraphTextBlockProps): JSX.Element => (
  <Paragraph {...props} styles={typeguards.isTextFragment(block) ? block.styles : []}>
    {typeguards.isTextFragment(block)
      ? /* eslint-disable indent */
        block.text
      : map(block.blocks, (subBlock: RichText.TextBlock, index: number) => (
          <ParagraphTextBlock key={index} {...props} block={subBlock} />
        ))}
  </Paragraph>
);

interface RichTextParagraphProps extends Omit<ParagraphProps, "level"> {
  readonly block: RichText.ParagraphBlock;
}

const RichTextParagraph = ({ block, ...props }: RichTextParagraphProps): JSX.Element => (
  <Paragraph {...props} styles={typeguards.isTextFragment(block.data) ? block.data.styles : []}>
    {typeguards.isTextFragment(block.data)
      ? block.data.text
      : map(block.data.blocks, (subBlock: RichText.TextBlock, index: number) => (
          <ParagraphTextBlock key={index} {...props} block={subBlock} />
        ))}
  </Paragraph>
);

export default RichTextParagraph;

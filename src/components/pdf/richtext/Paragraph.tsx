import { map } from "lodash";

import { pdf } from "lib";
import Paragraph, { ParagraphProps } from "../text/Paragraph";

interface ParagraphTextElementProps extends ParagraphProps {
  readonly textElement: RichText.TextDataElement;
}

const ParagraphTextElement = ({ textElement, ...props }: ParagraphTextElementProps): JSX.Element => (
  <Paragraph {...props} styles={pdf.typeguards.isTextFragment(textElement) ? textElement.styles : []}>
    {pdf.typeguards.isTextFragment(textElement)
      ? /* eslint-disable indent */
        textElement.text
      : map(textElement.data, (subTextElement: RichText.TextDataElement, index: number) => (
          <ParagraphTextElement key={index} {...props} textElement={subTextElement} />
        ))}
  </Paragraph>
);

interface RichTextParagraphProps extends Omit<ParagraphProps, "level"> {
  readonly block: RichText.ParagraphBlock;
}

const RichTextParagraph = ({ block, ...props }: RichTextParagraphProps): JSX.Element => (
  <Paragraph {...props}>
    {map(block.data, (textElement: RichText.TextDataElement, index: number) => (
      <ParagraphTextElement key={index} {...props} textElement={textElement} />
    ))}
  </Paragraph>
);

export default RichTextParagraph;

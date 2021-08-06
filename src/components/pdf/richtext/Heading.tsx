import { map } from "lodash";
import { pdf } from "lib";
import Heading, { HeadingProps } from "../text/Heading";

interface HeadingTextElementProps extends HeadingProps {
  readonly textElement: RichText.TextDataElement;
}

const HeadingTextElement = ({ textElement, ...props }: HeadingTextElementProps): JSX.Element => (
  <Heading {...props} styles={pdf.typeguards.isTextFragment(textElement) ? textElement.styles : []}>
    {pdf.typeguards.isTextFragment(textElement)
      ? /* eslint-disable indent */
        textElement.text
      : map(textElement.data, (subTextElement: RichText.TextDataElement, index: number) => (
          <HeadingTextElement key={index} {...props} textElement={subTextElement} />
        ))}
  </Heading>
);

interface RichTextHeadingProps extends Omit<HeadingProps, "level"> {
  readonly block: RichText.HeadingBlock;
}

const RichTextHeading = ({ block, ...props }: RichTextHeadingProps): JSX.Element => (
  <Heading {...props} level={block.level}>
    {map(block.data, (textElement: RichText.TextDataElement, index: number) => (
      <HeadingTextElement {...props} key={index} level={block.level} textElement={textElement} />
    ))}
  </Heading>
);

export default RichTextHeading;

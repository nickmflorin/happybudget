import React from "react";
import { isNil, map } from "lodash";

import { Paragraph } from "../text";
import { ParagraphProps } from "../text/Paragraph";

interface RichTextParagraphFragmentsProps extends Omit<ParagraphProps, "children" | "styles"> {
  readonly fragments: RichText.TextFragment[];
}

export const RichTextParagraphFragments = ({ fragments, ...props }: RichTextParagraphFragmentsProps): JSX.Element => (
  <React.Fragment>
    {map(fragments, (fragment: RichText.TextFragment, index: number) => (
      <RichTextParagraphFragment fragment={fragment} key={index} {...props} />
    ))}
  </React.Fragment>
);

interface RichTextParagraphFragmentProps extends Omit<ParagraphProps, "children" | "styles"> {
  readonly fragment: RichText.TextFragment;
}

const RichTextParagraphFragment = ({ fragment, ...props }: RichTextParagraphFragmentProps): JSX.Element => (
  <Paragraph {...props} styles={fragment.styles}>
    {!isNil(fragment.text) ? <Paragraph>{fragment.text}</Paragraph> : <></>}
    {!isNil(fragment.fragments) && fragment.fragments.length !== 0 ? (
      <RichTextParagraphFragments fragments={fragment.fragments} />
    ) : (
      <></>
    )}
  </Paragraph>
);

export default RichTextParagraphFragment;

import React from "react";
import { isNil, map } from "lodash";

import { Heading } from "../text";
import { HeadingProps } from "../text/Heading";

interface RichTextHeadingFragmentsProps extends Omit<HeadingProps, "children" | "styles"> {
  readonly fragments: RichText.TextFragment[];
}

export const RichTextHeadingFragments = ({ fragments, ...props }: RichTextHeadingFragmentsProps): JSX.Element => (
  <React.Fragment>
    {map(fragments, (fragment: RichText.TextFragment, index: number) => (
      <RichTextHeadingFragment fragment={fragment} key={index} {...props} />
    ))}
  </React.Fragment>
);

interface RichTextHeadingFragmentProps extends Omit<HeadingProps, "children" | "styles"> {
  readonly fragment: RichText.TextFragment;
}

const RichTextHeadingFragment = ({ fragment, ...props }: RichTextHeadingFragmentProps): JSX.Element => (
  <Heading {...props} styles={fragment.styles}>
    {!isNil(fragment.text) ? <Heading level={props.level}>{fragment.text}</Heading> : <></>}
    {!isNil(fragment.fragments) && fragment.fragments.length !== 0 ? (
      <RichTextHeadingFragments level={props.level} fragments={fragment.fragments} />
    ) : (
      <></>
    )}
  </Heading>
);

export default RichTextHeadingFragment;

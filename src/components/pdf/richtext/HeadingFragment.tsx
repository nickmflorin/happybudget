import { isNil, map } from "lodash";
import React from "react";

import { Heading } from "../text";
import { HeadingProps } from "../text/Heading";

interface RichTextHeadingFragmentProps extends Omit<HeadingProps, "children"> {
  readonly fragment: RichText.TextFragment;
}

const RichTextHeadingFragment = ({ fragment, ...props }: RichTextHeadingFragmentProps): JSX.Element => {
  // Note: We cannot use hooks with @react-pdf components, in particular because of the
  // render callbacks.
  let children: JSX.Element[] = !isNil(fragment.text) ? [<Heading level={props.level}>{fragment.text}</Heading>] : [];
  if (!isNil(fragment.children) && fragment.children.length !== 0) {
    children = [
      ...children,
      ...map(fragment.children, (child: RichText.TextFragment, index: number) => (
        <RichTextHeadingFragment fragment={child} {...props} />
      ))
    ];
  }
  return (
    <Heading {...props} styles={fragment.styles}>
      {map(children, (child: JSX.Element, index: number) => (
        <React.Fragment key={index}>{child}</React.Fragment>
      ))}
    </Heading>
  );
};

export default RichTextHeadingFragment;

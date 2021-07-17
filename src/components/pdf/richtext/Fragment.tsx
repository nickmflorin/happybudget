import { isNil, map } from "lodash";
import React from "react";

import { Paragraph } from "../text";
import { ParagraphProps } from "../text/Paragraph";

interface RichTextFragmentProps extends Omit<ParagraphProps, "children"> {
  readonly fragment: RichText.TextFragment;
}

const RichTextFragment = ({ fragment, ...props }: RichTextFragmentProps): JSX.Element => {
  // Note: We cannot use hooks with @react-pdf components, in particular because of the
  // render callbacks.
  let children: JSX.Element[] = !isNil(fragment.text) ? [<Paragraph>{fragment.text}</Paragraph>] : [];
  if (!isNil(fragment.children) && fragment.children.length !== 0) {
    children = [
      ...children,
      ...map(fragment.children, (child: RichText.TextFragment, index: number) => <RichTextFragment fragment={child} />)
    ];
  }
  return (
    <Paragraph {...props} styles={fragment.styles}>
      {map(children, (child: JSX.Element, index: number) => (
        <React.Fragment key={index}>{child}</React.Fragment>
      ))}
    </Paragraph>
  );
};

export default RichTextFragment;

import { isNil, map } from "lodash";
import React from "react";

import { Paragraph } from "../text";
import { ParagraphProps } from "../text/Paragraph";

interface RichTextParagraphFragmentProps extends Omit<ParagraphProps, "children" | "styles"> {
  readonly fragment: RichText.TextFragment;
}

const RichTextParagraphFragment = ({ fragment, ...props }: RichTextParagraphFragmentProps): JSX.Element => {
  // Note: We cannot use hooks with @react-pdf components, in particular because of the
  // render callbacks.
  let children: JSX.Element[] = !isNil(fragment.text) ? [<Paragraph>{fragment.text}</Paragraph>] : [];
  if (!isNil(fragment.children) && fragment.children.length !== 0) {
    children = [
      ...children,
      ...map(fragment.children, (child: RichText.TextFragment, index: number) => (
        <RichTextParagraphFragment fragment={child} {...props} />
      ))
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

export default RichTextParagraphFragment;

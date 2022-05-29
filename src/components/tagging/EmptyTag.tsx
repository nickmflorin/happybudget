import React from "react";

import Tag from "./Tag";

const isVisibleEmptyTagProps = (props: VisibleEmptyTagProps | InvisibleEmptyTagProps): props is VisibleEmptyTagProps =>
  (props as InvisibleEmptyTagProps).visible !== false;

export const EmptyTag: React.FC<EmptyTagProps> = (props: EmptyTagProps) => (
  <Tag style={{ ...props.style, opacity: isVisibleEmptyTagProps(props) ? 1 : 0 }}>
    {isVisibleEmptyTagProps(props) ? props.text : "None"}
  </Tag>
);

type MemoizedEmptyTagType = {
  (props: EmptyTagProps): JSX.Element;
};

export default React.memo(EmptyTag) as MemoizedEmptyTagType;

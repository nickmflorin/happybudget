import React, { ReactNode } from "react";

type ShowHideProps = {
  readonly show?: boolean;
  readonly hide?: boolean;
  readonly children: ReactNode;
};

/**
 * Component that will show or hide it's children depending on the conditionals
 * passed in.  One of `show` or `hide` must be passed in, if neither are passed
 * in the children will be shown regardless.
 */
const ShowHide = (props: ShowHideProps): JSX.Element => {
  if (Object.hasOwnProperty.call(props, "show")) {
    return <>{props.show ? props.children : <></>}</>;
  } else if (Object.hasOwnProperty.call(props, "hide")) {
    return <>{!props.hide ? props.children : <></>}</>;
  } else {
    return <>{props.children}</>;
  }
};

export default React.memo(ShowHide);

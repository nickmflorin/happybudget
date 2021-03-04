import { ReactNode } from "react";

/**
 * Component that will show or hide it's children depending on the conditionals
 * passed in.  One of `show` or `hide` must be passed in, if neither are passed
 * in the children will be shown regardless.
 */
function ShowHide(props: { show?: boolean; hide?: boolean; children: ReactNode }): JSX.Element {
  if (props.show !== undefined) {
    return <>{props.show ? props.children : <></>}</>;
  } else if (props.hide !== undefined) {
    return <>{!props.hide ? props.children : <></>}</>;
  } else {
    return <>{props.children}</>;
  }
}

export default ShowHide;

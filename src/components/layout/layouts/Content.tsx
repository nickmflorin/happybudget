import React from "react";
import { useSelector } from "react-redux";
import { CSSTransition, TransitionStatus } from "react-transition-group";
import classNames from "classnames";

import * as store from "store";
import DrawerTarget from "./DrawerTarget";

const Transitions: { [key in TransitionStatus]: React.CSSProperties } = {
  entering: { display: "flex" },
  entered: { display: "flex" },
  exiting: { display: "none" },
  exited: { display: "none" },
  unmounted: { display: "none" }
};

const Content = ({ children, ...props }: StandardComponentWithChildrenProps): JSX.Element => {
  const drawerOpen = useSelector(store.selectors.selectApplicationDrawerOpen);

  return (
    <div {...props} className={classNames("content", props.className)}>
      <div className={"sub-content"}>{children}</div>
      <CSSTransition in={drawerOpen} timeout={4000}>
        {(state: TransitionStatus) => (
          <DrawerTarget
            style={{
              transition: "all 1s",
              display: "none",
              ...Transitions[state]
            }}
          />
        )}
      </CSSTransition>
    </div>
  );
};

export default React.memo(Content);

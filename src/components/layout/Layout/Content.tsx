import classNames from "classnames";
import { useSelector } from "react-redux";
import { CSSTransition, TransitionStatus } from "react-transition-group";

import * as store from "application/store";
import { ui } from "lib";

import { DrawerTarget } from "../DrawerTarget";

const Transitions: { [key in TransitionStatus]: ui.Style } = {
  entering: { display: "flex" },
  entered: { display: "flex" },
  exiting: { display: "none" },
  exited: { display: "none" },
  unmounted: { display: "none" },
};

export type ContentProps = ui.ComponentProps<{ readonly children: JSX.Element }>;

/**
 * A component that represents the content to the right of the <Sidebar /> and underneath the
 * <Header /> in the overall application layout.
 */
export const Content = (props: ContentProps): JSX.Element => {
  const drawerOpen = useSelector(store.selectors.selectApplicationDrawerOpen);
  return (
    <div {...props} className={classNames("content", props.className)}>
      <div className="content-viewport">{props.children}</div>
      <CSSTransition in={drawerOpen} timeout={4000}>
        {(state: TransitionStatus) => (
          <DrawerTarget
            style={{
              transition: "all 1s",
              display: "none",
              ...Transitions[state],
            }}
          />
        )}
      </CSSTransition>
    </div>
  );
};

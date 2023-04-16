import React from "react";

import classNames from "classnames";
import { useDispatch } from "react-redux";

import * as store from "application/store";
import { IconButton } from "components/buttonsOld";

const DrawerTarget = (props: Omit<StandardComponentProps, "id">): JSX.Element => {
  const dispatch = useDispatch();
  return (
    <div {...props} className={classNames("drawer", props.className)}>
      <IconButton
        className="btn--drawer-close"
        icon="close"
        onClick={() => dispatch(store.actions.setApplicationDrawerAction(false, {}))}
      />
      <div id="drawer-target" className="drawer-content"></div>
    </div>
  );
};

export default React.memo(DrawerTarget);

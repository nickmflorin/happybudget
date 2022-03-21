import React from "react";
import { useDispatch } from "react-redux";
import classNames from "classnames";

import * as store from "store";
import { IconButton } from "components/buttons";

const DrawerTarget = (props: Omit<StandardComponentProps, "id">): JSX.Element => {
  const dispatch = useDispatch();
  return (
    <div {...props} className={classNames("drawer", props.className)}>
      <IconButton
        className={"btn--drawer-close"}
        icon={"close"}
        onClick={() => dispatch(store.actions.setApplicationDrawerAction(false))}
      />
      <div id={"drawer-target"} className={"drawer-content"}></div>
    </div>
  );
};

export default React.memo(DrawerTarget);

import React from "react";

import classNames from "classnames";
// import { useDispatch } from "react-redux";

/* // import { store } from "application";
   import * as ui from "lib/ui/types"; */

// import * as icons from "lib/ui/icons";
import { BareActionButton } from "components/buttons";

export type DrawerTargetProps = Omit<ui.ComponentProps, "id">;

export const DrawerTarget = React.memo(
  (props: DrawerTargetProps): JSX.Element => (
    // const dispatch = useDispatch();
    <div {...props} className={classNames("drawer", props.className)}>
      <BareActionButton
        icon={icons.IconNames.CIRCLE_XMARK}
        onClick={() => {
          console.log("CLICKED");
          // dispatch(store.actions.setApplicationDrawerAction(false, {}))}
        }}
      />
      <div id="drawer-target" className="drawer-content"></div>
    </div>
  ),
);

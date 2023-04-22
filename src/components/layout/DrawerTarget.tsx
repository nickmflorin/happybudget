import React from "react";

import classNames from "classnames";
import { useDispatch } from "react-redux";

import { store } from "application";
import { ui } from "lib";
import { BareActionButton } from "components/buttons";

export type DrawerTargetProps = Omit<ui.ComponentProps, "id">;

export const DrawerTarget = React.memo((props: DrawerTargetProps): JSX.Element => {
  const dispatch = useDispatch();
  return (
    <div {...props} className={classNames("drawer", props.className)}>
      <BareActionButton
        icon={ui.IconNames.CIRCLE_XMARK}
        onClick={() => dispatch(store.actions.setApplicationDrawerAction(false, {}))}
      />
      <div id="drawer-target" className="drawer-content"></div>
    </div>
  );
});

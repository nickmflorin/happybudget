import React from "react";

import { map } from "lodash";

import MenuAction from "./MenuAction";

type AuthenticatedToolbarProps = {
  readonly actions: Table.MenuActionObj[];
};

const AuthenticatedToolbar = (props: AuthenticatedToolbarProps): JSX.Element => (
  <div className="toolbar-buttons">
    {map(props.actions, (action: Table.MenuActionObj, index: number) => (
      <MenuAction key={index} action={action} />
    ))}
  </div>
);

export default React.memo(AuthenticatedToolbar) as typeof AuthenticatedToolbar;

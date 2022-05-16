import React from "react";
import { map } from "lodash";
import MenuAction from "./MenuAction";

type PublicToolbarProps = {
  readonly actions: Table.MenuActionObj[];
};

const PublicToolbar = (props: PublicToolbarProps): JSX.Element => {
  return (
    <div className={"toolbar-buttons"}>
      {map(props.actions, (action: Table.MenuActionObj, index: number) =>
        !(action.isWriteOnly === true) ? <MenuAction key={index} action={action} /> : <React.Fragment key={index} />
      )}
    </div>
  );
};

export default React.memo(PublicToolbar) as typeof PublicToolbar;

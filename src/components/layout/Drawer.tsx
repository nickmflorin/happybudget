import React from "react";

import Portal from "./Portal";

type DrawerProps = { readonly children: JSX.Element };

const Drawer = (props: DrawerProps): JSX.Element => <Portal id={"drawer-target"}>{props.children}</Portal>;

export default React.memo(Drawer);

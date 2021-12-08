import React from "react";
import classNames from "classnames";
import GenericMenu from "./Generic";

const ModelMenu = <M extends Model.Model>(props: IMenu<M>): JSX.Element => (
  <GenericMenu<M> {...props} className={classNames("model-menu", props.className)} />
);

export default React.memo(ModelMenu) as typeof ModelMenu;

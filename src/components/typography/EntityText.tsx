import React from "react";
import classNames from "classnames";

import { isAccountOrSubAccountForm } from "lib/model/typeguards";

import "./EntityText.scss";

interface EntityTextProps extends StandardComponentProps {
  children: Model.Entity | Model.SimpleEntity;
}

const EntityText: React.FC<EntityTextProps> = ({ children, className, style = {} }) => {
  return (
    <div className={classNames("entity-text", className)} style={style}>
      <span className={"identifier"}>{isAccountOrSubAccountForm(children) ? children.identifier : children.name}</span>
      <span className={"description"}>{isAccountOrSubAccountForm(children) ? children.description : ""}</span>
    </div>
  );
};

export default EntityText;

import React from "react";
import classNames from "classnames";
import "./EntityText.scss";

interface EntityTextProps extends StandardComponentProps {
  children: IEntity | IAccount | ISubAccount | IBudgetItem | IBudgetItemNode;
}

const EntityText: React.FC<EntityTextProps> = ({ children, className, style = {} }) => {
  return (
    <div className={classNames("entity-text", className)} style={style}>
      <span className={"identifier"}>{children.identifier}</span>
      <span className={"description"}>{children.description}</span>
    </div>
  );
};

export default EntityText;

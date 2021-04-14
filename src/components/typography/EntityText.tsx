import React from "react";
import classNames from "classnames";
import "./EntityText.scss";

interface EntityTextProps extends StandardComponentProps {
  children: Model.Entity | Model.Account | Model.SubAccount | Model.BudgetItem | Model.BudgetItemNode;
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

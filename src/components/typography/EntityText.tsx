import React, { useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { isAccountOrSubAccountForm } from "lib/model/typeguards";

import "./EntityText.scss";

export interface EntityTextProps extends StandardComponentProps {
  children: Model.Entity | Model.SimpleEntity;
}

const EntityText: React.FC<EntityTextProps> = ({ children, className, style = {} }) => {
  const identifier = useMemo(() => {
    if (isAccountOrSubAccountForm(children)) {
      return children.identifier;
    }
    return children.name;
  }, [children]);
  const description = useMemo(() => {
    if (isAccountOrSubAccountForm(children)) {
      return children.description;
    }
    return undefined;
  }, [children]);
  return (
    <div className={classNames("entity-text", className)} style={style}>
      {!isNil(identifier) && <span className={"identifier"}>{identifier}</span>}
      {!isNil(description) && <span className={"description"}>{description}</span>}
    </div>
  );
};

export default EntityText;

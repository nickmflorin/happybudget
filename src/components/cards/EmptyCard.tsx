import React from "react";
import classNames from "classnames";

import { Icon } from "components";

import "./EmptyCard.scss";

interface EmptyCardProps extends StandardComponentProps {
  readonly title?: string;
  readonly icon?: IconProp;
  readonly onClick?: () => void;
}

const EmptyCard = ({ icon, onClick, className, style = {} }: EmptyCardProps): JSX.Element => {
  return (
    <div className={"empty-card-wrapper"}>
      <div className={classNames("empty-card", className)} style={style} onClick={onClick}>
        <Icon icon={icon} weight={"light"} />
      </div>
    </div>
  );
};

export default React.memo(EmptyCard);

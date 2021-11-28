import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { ShowHide, Icon } from "components";

import "./EmptyCard.scss";

interface EmptyCardProps extends StandardComponentProps {
  title?: string;
  icon?: IconProp;
  onClick?: () => void;
}

const EmptyCard = ({ title, icon, onClick, className, style = {} }: EmptyCardProps): JSX.Element => {
  return (
    <div className={"empty-card-wrapper"}>
      <div className={classNames("empty-card", className)} style={style} onClick={onClick}>
        <Icon icon={icon} weight={"light"} />
      </div>
      <ShowHide show={!isNil(title)}>
        <div className={"title"}>{title}</div>
      </ShowHide>
    </div>
  );
};

export default React.memo(EmptyCard);

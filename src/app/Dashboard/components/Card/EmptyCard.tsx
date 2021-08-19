import { isNil } from "lodash";
import classNames from "classnames";

import { ShowHide, Icon } from "components";
import { IconType } from "components/Icon";

import "./index.scss";

interface EmptyCardProps extends StandardComponentProps {
  title?: string;
  icon?: IconType;
  onClick?: () => void;
}

const EmptyCard = ({ title, icon, onClick, className, style = {} }: EmptyCardProps): JSX.Element => {
  return (
    <div className={classNames("dashboard-empty-card", className)} style={style} onClick={onClick}>
      <div>
        <Icon icon={icon} />
        <ShowHide show={!isNil(title)}>
          <div className={"title"}>{title}</div>
        </ShowHide>
      </div>
    </div>
  );
};

export default EmptyCard;

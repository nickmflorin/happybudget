import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImagePolaroid, faEllipsisV } from "@fortawesome/pro-light-svg-icons";

import { ShowHide, RenderWithSpinner, Dropdown } from "components";
import { IconButton } from "components/buttons";
import { IDropdownMenuItem } from "components/menus/DropdownMenu";

import "./index.scss";

interface DashboardCardImagePlaceholderProps {
  onClick?: () => void;
  titleOnly?: boolean;
}

const DashboardCardImagePlaceholder: React.FC<DashboardCardImagePlaceholderProps> = ({ titleOnly, onClick }) => {
  return (
    <div className={classNames("image-placeholder", { "title-only": titleOnly })} onClick={onClick}>
      <FontAwesomeIcon className={"icon"} icon={faImagePolaroid} />
    </div>
  );
};

interface DashboardCardImageProps {
  image: string;
  onClick?: () => void;
  titleOnly?: boolean;
}

const DashboardCardImage: React.FC<DashboardCardImageProps> = ({ image, onClick, titleOnly }) => {
  return (
    <div className={classNames("image", { "title-only": titleOnly })} onClick={onClick}>
      <div className={"image-tint"}></div>
      <img src={image} alt={"avatar"} />
    </div>
  );
};

interface CardProps extends StandardComponentProps {
  dropdown?: IDropdownMenuItem[];
  title: string;
  subTitle?: string;
  image?: string | null;
  loading?: boolean;
  onClick?: () => void;
}

const Card = ({
  title,
  subTitle,
  dropdown,
  onClick,
  loading,
  image,
  style = {},
  className
}: CardProps): JSX.Element => {
  return (
    <div className={classNames("dashboard-card", className)} style={style}>
      <RenderWithSpinner size={18} loading={loading} toggleOpacity={true}>
        {!isNil(dropdown) && (
          <Dropdown items={dropdown} placement={"bottomRight"} trigger={["click"]}>
            <IconButton
              className={classNames("dropdown-ellipsis", { "for-placeholder": isNil(image) })}
              icon={<FontAwesomeIcon icon={faEllipsisV} />}
            />
          </Dropdown>
        )}
        {!isNil(image) ? (
          <DashboardCardImage image={image} onClick={onClick} titleOnly={isNil(subTitle)} />
        ) : (
          <DashboardCardImagePlaceholder onClick={onClick} titleOnly={isNil(subTitle)} />
        )}
        <div className={classNames("dashboard-card-footer", { "title-only": isNil(subTitle) })} onClick={onClick}>
          <div className={"title"}>{title}</div>
          <ShowHide show={!isNil(subTitle)}>
            <div className={"sub-title"}>{subTitle}</div>
          </ShowHide>
        </div>
      </RenderWithSpinner>
    </div>
  );
};

export default Card;

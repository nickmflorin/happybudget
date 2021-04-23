import React from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImagePolaroid, faEllipsisV } from "@fortawesome/pro-light-svg-icons";

import { Dropdown } from "components/dropdowns";
import { IconButton } from "components/buttons";
import { ShowHide, RenderWithSpinner } from "components";
import "./Card.scss";

interface DashboardCardImagePlaceholderProps {
  onClick?: () => void;
}

const DashboardCardImagePlaceholder: React.FC<DashboardCardImagePlaceholderProps> = ({ onClick }) => {
  return (
    <div className={"image-placeholder"} onClick={onClick}>
      <FontAwesomeIcon className={"icon"} icon={faImagePolaroid} />
    </div>
  );
};

interface DashboardCardImageProps {
  image: string;
  onClick?: () => void;
}

const DashboardCardImage: React.FC<DashboardCardImageProps> = ({ image, onClick }) => {
  return (
    <div className={"image"} onClick={onClick}>
      <div className={"image-tint"}></div>
      <img src={image} alt={"avatar"} />
    </div>
  );
};

interface CardProps extends StandardComponentProps {
  dropdown?: MenuItem[];
  title?: string;
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
      <RenderWithSpinner loading={loading}>
        <React.Fragment>
          {!isNil(dropdown) && (
            <Dropdown items={dropdown} placement={"bottomRight"}>
              <IconButton
                className={classNames("dropdown-ellipsis", { "for-placeholder": isNil(image) })}
                icon={<FontAwesomeIcon icon={faEllipsisV} />}
              />
            </Dropdown>
          )}
          {!isNil(image) ? (
            <DashboardCardImage image={image} onClick={onClick} />
          ) : (
            <DashboardCardImagePlaceholder onClick={onClick} />
          )}
          <div className={"dashboard-card-footer"} onClick={onClick}>
            <ShowHide show={!isNil(title)}>
              <div className={"title"}>{title}</div>
            </ShowHide>
            <ShowHide show={!isNil(subTitle)}>
              <div className={"sub-title"}>{subTitle}</div>
            </ShowHide>
          </div>
        </React.Fragment>
      </RenderWithSpinner>
    </div>
  );
};

export default Card;

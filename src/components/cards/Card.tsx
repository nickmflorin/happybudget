import { useMemo, useState } from "react";

import { isNil } from "lodash";
import classNames from "classnames";

import { Icon, ShowHide, RenderWithSpinner, Dropdown } from "components";
import { IconButton } from "components/buttons";
import { BudgetCardImage } from "components/images";

import "./Card.scss";

interface CardProps extends StandardComponentProps {
  readonly dropdown?: MenuItemModel[];
  readonly title: string;
  readonly subTitle?: string;
  readonly image: SavedImage | null;
  readonly loading?: boolean;
  readonly onClick?: () => void;
  readonly hidden?: boolean;
}

const Card = ({
  title,
  subTitle,
  dropdown,
  onClick,
  loading,
  image,
  hidden = false,
  style = {},
  className
}: CardProps): JSX.Element => {
  const [imageError, setImageError] = useState(false);

  const dropdownEllipsisClassName = useMemo(() => {
    if (isNil(image) || !isNil(imageError)) {
      return "dark";
    }
    return "";
  }, [image]);

  return (
    <div className={classNames("card", className, { hidden })} style={style}>
      <RenderWithSpinner size={18} loading={loading} toggleOpacity={true}>
        <ShowHide show={hidden}>
          <Icon className={"icon--hidden"} icon={"eye-slash"} weight={"solid"} />
        </ShowHide>
        {!isNil(dropdown) && (
          <Dropdown menuItems={dropdown} placement={"bottomRight"} trigger={["click"]}>
            <IconButton
              className={classNames("dropdown-ellipsis", dropdownEllipsisClassName)}
              icon={<Icon icon={"ellipsis-v"} weight={"light"} />}
            />
          </Dropdown>
        )}
        <BudgetCardImage
          image={image}
          onClick={onClick}
          titleOnly={isNil(subTitle)}
          onError={() => setImageError(true)}
          onLoad={() => setImageError(false)}
        />
        <div className={classNames("card-footer", { "title-only": isNil(subTitle) })} onClick={onClick}>
          <div className={"title"}>{title}</div>
          <ShowHide show={!isNil(subTitle)}>
            <div className={"sub-title truncate"}>{subTitle}</div>
          </ShowHide>
        </div>
      </RenderWithSpinner>
    </div>
  );
};

export default Card;

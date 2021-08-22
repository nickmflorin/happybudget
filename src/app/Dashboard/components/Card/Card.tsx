import { isNil } from "lodash";
import classNames from "classnames";

import { Icon, ShowHide, RenderWithSpinner, Dropdown } from "components";
import { IconButton } from "components/buttons";
import { BudgetCardImage } from "components/layout/Layout/images";

import "./index.scss";

interface CardProps extends StandardComponentProps {
  dropdown?: MenuItemModel[];
  title: string;
  subTitle?: string;
  image: SavedImage | null;
  loading?: boolean;
  onClick?: () => void;
  hidden?: boolean;
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
  return (
    <div className={classNames("dashboard-card", className, { hidden })} style={style}>
      <RenderWithSpinner size={18} loading={loading} toggleOpacity={true}>
        <ShowHide show={hidden}>
          <Icon className={"icon--hidden"} icon={"eye-slash"} weight={"solid"} />
        </ShowHide>
        {!isNil(dropdown) && (
          <Dropdown menuItems={dropdown} placement={"bottomRight"} trigger={["click"]}>
            <IconButton
              className={classNames("dropdown-ellipsis", { "for-placeholder": isNil(image) })}
              icon={<Icon icon={"ellipsis-v"} weight={"light"} />}
            />
          </Dropdown>
        )}
        <BudgetCardImage image={image} onClick={onClick} titleOnly={isNil(subTitle)} />
        <div className={classNames("dashboard-card-footer", { "title-only": isNil(subTitle) })} onClick={onClick}>
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

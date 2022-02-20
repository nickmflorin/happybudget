import React, { useMemo, useState } from "react";

import { isNil, map } from "lodash";
import classNames from "classnames";

import { Icon, ShowHide, RenderWithSpinner } from "components";
import { IconButton } from "components/buttons";
import { DropdownMenu } from "components/dropdowns";
import { CardImage } from "components/images";

import "./Card.scss";

type CardCornerActionRenderer = {
  readonly render: () => JSX.Element;
  readonly visible: boolean;
};

type CardCornerAction = JSX.Element | CardCornerActionRenderer;

const isCornerActionRender = (action: CardCornerAction): action is CardCornerActionRenderer =>
  typeof action === "object";

export type CardProps = StandardComponentProps & {
  readonly dropdown?: MenuItemModel[];
  readonly title: string;
  readonly subTitle?: string;
  readonly image: SavedImage | null;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  /* When providing users with a tour, we often need to link directly to the
     card based on the entity it is showing.  This attribute is attributed to
     the <div> element such that the `tour-id` attribute can be accessed via
     the touring software. Note that it is not necessarily guaranteed to be
		 unique. */
  readonly tourId?: string;
  readonly cornerActions?: (iconClassName: string) => CardCornerAction[];
  readonly onClick?: () => void;
};

const Card = ({
  title,
  subTitle,
  dropdown,
  loading,
  disabled,
  image,
  tourId,
  cornerActions,
  onClick,
  ...props
}: CardProps): JSX.Element => {
  const [imageError, setImageError] = useState(false);

  const iconClassName = useMemo(() => {
    if (isNil(image) || imageError === true) {
      return "dark";
    }
    return "";
  }, [image, imageError]);

  const divProps = useMemo(() => {
    const Props = {
      ...props,
      "data-tour-id": tourId,
      className: classNames("card", props.className, { disabled: loading || disabled, loading })
    };
    if (!isNil(tourId)) {
      return { ...Props, "data-tour-id": tourId.replace(" ", "").toLowerCase() };
    }
    return Props;
  }, [props, tourId]);

  return (
    <div {...divProps}>
      {!isNil(cornerActions) && (
        <div className={"card-corner-actions"}>
          {map(cornerActions(iconClassName), (action: CardCornerAction, index: number) => {
            if (isCornerActionRender(action)) {
              return <React.Fragment key={index}>{action.visible === true ? action.render() : <></>}</React.Fragment>;
            }
            return <React.Fragment key={index}>{action}</React.Fragment>;
          })}
        </div>
      )}
      <div className={"card-inner"}>
        <RenderWithSpinner spinnerProps={{ size: "small" }} loading={loading}>
          <React.Fragment>
            {!isNil(dropdown) && (
              <DropdownMenu models={dropdown} placement={"bottomRight"}>
                <IconButton
                  className={classNames("dropdown-ellipsis", iconClassName)}
                  icon={<Icon icon={"ellipsis-v"} weight={"light"} dimension={{ height: 26 }} />}
                />
              </DropdownMenu>
            )}
            <CardImage
              image={image}
              onClick={disabled ? undefined : onClick}
              titleOnly={isNil(subTitle)}
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
            <div
              className={classNames("card-footer", { "title-only": isNil(subTitle) })}
              onClick={disabled ? undefined : onClick}
            >
              <div className={"title"}>{title}</div>
              <ShowHide show={!isNil(subTitle)}>
                <div className={"sub-title truncate"}>{subTitle}</div>
              </ShowHide>
            </div>
          </React.Fragment>
        </RenderWithSpinner>
      </div>
    </div>
  );
};

export default React.memo(Card);

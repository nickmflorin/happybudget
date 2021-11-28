import React from "react";
import classNames from "classnames";

import { Icon } from "components";
import Image, { ImageProps } from "./Image";
import "./BudgetCardImage.scss";

interface BudgetCardImagePlaceholderProps {
  readonly onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  readonly titleOnly?: boolean;
}

const BudgetCardImagePlaceholder: React.FC<BudgetCardImagePlaceholderProps> = ({ titleOnly, onClick }) => {
  return (
    <div className={classNames("budget-card-image-placeholder", { "title-only": titleOnly })} onClick={onClick}>
      <Icon icon={"image-polaroid"} weight={"light"} />
    </div>
  );
};

interface BudgetCardImageProps
  extends BudgetCardImagePlaceholderProps,
    Omit<ImageProps, "src" | "wrapperClassName" | "tint"> {
  readonly image: SavedImage | null;
  readonly titleOnly?: boolean;
}

const BudgetCardImage: React.FC<BudgetCardImageProps> = ({ image, titleOnly, ...props }) => (
  <Image
    {...props}
    wrapperClassName={classNames("budget-card-image-wrapper", { "title-only": titleOnly })}
    fallbackComponent={<BudgetCardImagePlaceholder titleOnly={titleOnly} onClick={props.onClick} />}
    src={image?.url}
    tint={true}
  />
);

export default React.memo(BudgetCardImage);

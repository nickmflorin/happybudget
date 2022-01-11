import React from "react";
import classNames from "classnames";

import { Icon } from "components";
import Image, { ImageProps } from "./Image";
import "./CardImage.scss";

interface CardImagePlaceholderProps {
  readonly onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  readonly titleOnly?: boolean;
}

const CardImagePlaceholder: React.FC<CardImagePlaceholderProps> = ({ titleOnly, onClick }) => {
  return (
    <div className={classNames("card-image-placeholder", { "title-only": titleOnly })} onClick={onClick}>
      <Icon icon={"image-polaroid"} weight={"light"} />
    </div>
  );
};

interface CardImageProps extends CardImagePlaceholderProps, Omit<ImageProps, "src" | "wrapperClassName" | "tint"> {
  readonly image: SavedImage | null;
  readonly titleOnly?: boolean;
}

const CardImage: React.FC<CardImageProps> = ({ image, titleOnly, ...props }) => (
  <Image
    {...props}
    wrapperClassName={classNames("card-image-wrapper", { "title-only": titleOnly })}
    fallbackComponent={<CardImagePlaceholder titleOnly={titleOnly} onClick={props.onClick} />}
    src={image?.url}
    tint={true}
  />
);

export default React.memo(CardImage);

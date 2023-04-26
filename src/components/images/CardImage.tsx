import React from "react";
import classNames from "classnames";

import { Icon } from "components";
import Image, { ImageProps } from "./Image";

type CardImagePlaceholderProps = {
  readonly onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  readonly titleOnly?: boolean;
};

const CardImagePlaceholder: React.FC<CardImagePlaceholderProps> = React.memo(({ titleOnly, onClick }) => (
  <div className={classNames("card-image-placeholder", { "title-only": titleOnly })} onClick={onClick}>
    <Icon icon={"image-polaroid"} weight={"solid"} />
  </div>
));

type CardImageProps = CardImagePlaceholderProps &
  Omit<ImageProps, "src" | "wrapperClassName" | "tint"> & {
    readonly image: SavedImage | null;
    readonly titleOnly?: boolean;
  };

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

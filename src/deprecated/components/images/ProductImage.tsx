import React from "react";

import classNames from "classnames";

import { notifications } from "lib";
import { Icon } from "components";

import Image, { ImageProps } from "../../../components/images/Image";

export interface ProductImageProps extends Omit<ImageProps, "src" | "circle" | "fallbackIcon"> {
  readonly product: Model.Product;
}

const ProductImage = ({ product, ...props }: ProductImageProps): JSX.Element => (
  <Image
    {...props}
    circle={true}
    fallbackIcon={<Icon icon="shopping-bag" weight="solid" />}
    className={classNames("img--product", props.className)}
    src={product.image}
    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
      notifications.internal.notify({
        message: `Error loading product image at src ${product.image || "unknown"}!`,
        dispatchToSentry: true,
        level: "error",
      });
      props.onError?.(e);
    }}
  />
);

export default React.memo(ProductImage);

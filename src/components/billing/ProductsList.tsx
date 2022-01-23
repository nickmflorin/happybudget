import React from "react";
import classNames from "classnames";
import { map } from "lodash";

import Product from "./Product";

interface ProductsListProps extends StandardComponentProps {
  readonly products: Model.Product[];
  readonly extra?: (p: Model.Product) => JSX.Element;
}

const ProductsList = ({ products, extra, ...props }: ProductsListProps) => {
  return (
    <div {...props} className={classNames("products", props.className)}>
      {map(products, (product: Model.Product, index: number) => (
        <Product key={index} product={product} extra={extra?.(product)} />
      ))}
    </div>
  );
};

export default React.memo(ProductsList);

import React from "react";
import classNames from "classnames";
import { map, isNil } from "lodash";

import { Icon } from "components";
import Product from "./Product";

interface ProductsListProps extends StandardComponentProps {
  readonly products: Model.Product[];
  readonly selectedProduct: string | null;
  readonly onChange?: (product: Model.Product) => void;
}

const ProductsList = ({ products, onChange, selectedProduct, ...props }: ProductsListProps) => {
  return (
    <div {...props} className={classNames("products", props.className)}>
      {map(products, (product: Model.Product, index: number) => (
        <Product
          key={index}
          product={product}
          onClick={() => onChange?.(product)}
          extra={
            !isNil(selectedProduct) && selectedProduct === product.id ? (
              <Icon style={{ fontSize: 18 }} icon={"check-circle"} weight={"solid"} green={true} />
            ) : undefined
          }
        />
      ))}
    </div>
  );
};

export default React.memo(ProductsList);

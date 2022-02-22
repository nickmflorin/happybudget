import React, { ReactNode } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import { ProductImage } from "components/images";

type ProductProps = StandardComponentProps & {
  readonly product: Model.Product;
  readonly extra?: ReactNode;
  readonly hoverBehavior?: boolean;
  readonly onClick?: () => void;
};

const Product = ({ onClick, product, extra, hoverBehavior, ...props }: ProductProps): JSX.Element => {
  return (
    <div
      {...props}
      className={classNames("product", props.className, { "highlight-on-hover": hoverBehavior !== false })}
      onClick={onClick}
    >
      <ProductImage product={product} wrapperStyle={{ height: 36, width: 36 }} />
      <div className={"product-detail"}>
        <h4>{product.name}</h4>
        <p className={"product-description"}>{product.description}</p>
      </div>
      {!isNil(extra) && <div className={"product-extra"}>{extra}</div>}
    </div>
  );
};

export default React.memo(Product);

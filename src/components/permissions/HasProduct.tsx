import { ReactNode, useMemo } from "react";

import { ShowHide } from "components";
import { model } from "lib";
import * as store from "store";

interface HasProductProps {
  readonly children: ReactNode;
  readonly product?: SingleOrArray<Model.ProductId> | null;
}

const HasProduct: React.FC<HasProductProps> = ({ product, children }) => {
  const user = store.hooks.useLoggedInUser();
  const visible = useMemo(
    () => model.user.userHasProduct(user, product),
    [product, user.product_id, user.billing_status]
  );
  return <ShowHide show={visible}>{children}</ShowHide>;
};

export default HasProduct;

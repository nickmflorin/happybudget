import { ReactNode, useMemo } from "react";

import { ShowHide } from "components";
import { users } from "lib";

interface HasProductProps {
  readonly children: ReactNode;
  readonly product?: SingleOrArray<Model.ProductId> | null;
}

const HasProduct: React.FC<HasProductProps> = ({ product, children }) => {
  const user = users.hooks.useLoggedInUser();
  const visible = useMemo(
    () => users.models.userHasProduct(user, product),
    [product, user.product_id, user.billing_status]
  );
  return <ShowHide show={visible}>{children}</ShowHide>;
};

export default HasProduct;

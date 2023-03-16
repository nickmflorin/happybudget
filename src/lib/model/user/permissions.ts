import { includes, map, filter } from "lodash";

export enum Permissions {
  MULTIPLE_BUDGETS = "multiple_budgets",
}

export const ProductPermissions: { [key in Model.ProductPermissionId]: Array<Model.ProductId> } = {
  multiple_budgets: ["standard"],
};

export enum ProductPermissionIds {
  MULTIPLE_BUDGETS = "multiple_budgets",
}

export const userHasProduct = (
  user: Model.User,
  product?: SingleOrArray<Model.ProductId> | null,
): boolean => {
  if (user.billing_status === null || user.product_id === null) {
    if (user.product_id !== null) {
      /* This should not happen, as these should coincide in the backend - but
				 just in case, we want to issue an error. */
      console.error(
        `User ${user.id} does not have a billing status, but has an assigned product ID ${user.product_id}.`,
      );
    } else if (user.billing_status !== null) {
      /* This should not happen, as these should coincide in the backend - but
				 just in case, we want to issue an error. */
      console.error(
        `User ${user.id} does not have a product ID, but has an assigned billing status ${user.billing_status}.`,
      );
    }
    /* A null product means that we are interested in Users that do not have
			 any associated product, an undefined product means that we are interested
			 in Users that have any associated product. */
    return product === null ? true : false;
  } else if (product === null) {
    /* A null product means that we are interested in Users that do not have
			 any associated product, and here - the User is associated with a
			 product. */
    return false;
  } else if (product === undefined) {
    /* A undefined product means that we are interested in Users that have
			 any associated product, and here - the User is associated with a
			 product. */
    return true;
  }
  const product_ids = Array.isArray(product) ? product : [product];
  return includes(product_ids, user.product_id);
};

export const userHasPermission = (user: Model.User, permission: Model.ProductPermissionId) =>
  filter(
    map(ProductPermissions[permission], (p: Model.ProductId) => userHasProduct(user, p)),
    (v: boolean) => v === true,
  ).length !== 0;

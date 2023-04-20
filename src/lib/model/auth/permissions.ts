import { includes, map, filter } from "lodash";

import { logger } from "internal";

import { SingleOrArray } from "../../util";
import * as billing from "../billing";
import * as user from "../user";

export const ProductPermissions: { [key in billing.ProductPermissionId]: billing.ProductId[] } = {
  [billing.ProductPermissionIds.MULTIPLE_BUDGETS]: [billing.ProductIds.STANDARD],
};

export const userHasProduct = (
  user: user.User,
  product?: SingleOrArray<billing.ProductId> | null,
): boolean => {
  if (user.billing_status === null || user.product_id === null) {
    if (user.product_id !== null) {
      /* This should not happen, as these should coincide in the backend - but just in case, we want
         to issue an error. */
      logger.error(
        { userId: user.id, productId: user.product_id, billingStatus: user.billing_status },
        `User ${user.id} does not have a billing status, but has an assigned product ID ` +
          `${user.product_id}.`,
      );
    } else if (user.billing_status !== null) {
      /* This should not happen, as these should coincide in the backend - but just in case, we want
         to issue an error. */
      logger.error(
        { userId: user.id, productId: user.product_id, billingStatus: user.billing_status },
        `User ${user.id} does not have a product ID, but has an assigned billing status ` +
          `${user.billing_status}.`,
      );
    }
    /* A null product means that we are interested in Users that do not have any associated product,
       an undefined product means that we are interested in Users that have any associated product.
       */
    return product === null ? true : false;
  } else if (product === null) {
    /* A null product means that we are interested in Users that do not have any associated product,
       and here - the User is associated with a product. */
    return false;
  } else if (product === undefined) {
    /* A undefined product means that we are interested in Users that have any associated product,
       and here - the User is associated with a product. */
    return true;
  }
  const product_ids = Array.isArray(product) ? product : [product];
  return includes(product_ids, user.product_id);
};

export const userHasPermission = (user: user.User, permission: billing.ProductPermissionId) =>
  filter(
    map(ProductPermissions[permission], (p: billing.ProductId) => userHasProduct(user, p)),
    (v: boolean) => v === true,
  ).length !== 0;

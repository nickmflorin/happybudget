import React, { useState, useEffect, useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import * as api from "api";
import { notifications, model, util } from "lib";
import * as store from "store";

import { Separator, RenderOrSpinner } from "components";
import { PrimaryButton } from "components/buttons";
import { Tag } from "components/tagging";

import ProductsList from "./ProductsList";
import Product from "./Product";

type ProductsManagerProps = StandardComponentProps & {
  readonly onSubscribe: (p: Model.Product) => void;
  readonly onManage: () => void;
  readonly subscribing: Model.ProductId | null;
  readonly managing: boolean;
};

const ProductsManager = ({
  onSubscribe,
  onManage,
  managing,
  subscribing,
  ...props
}: ProductsManagerProps): JSX.Element => {
  const [products, setProducts] = useState<Model.Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Model.Subscription | null>(null);
  const user = store.hooks.useLoggedInUser();

  useEffect(() => {
    setLoading(true);
    api
      .getProducts()
      .then((response: Http.ListResponse<Model.Product>) => setProducts(response.data))
      .catch((e: Error) => notifications.ui.banner.handleRequestError(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .getSubscription()
      .then((response: { subscription: Model.Subscription | null }) => setSubscription(response.subscription))
      .catch((e: Error) => notifications.ui.banner.handleRequestError(e));
  }, []);

  const userProduct = useMemo(() => {
    return user.product_id !== null && products.length !== 0
      ? model.getModel(products, user.product_id, { modelName: "product" })
      : null;
  }, [products, user]);

  const subscriptionDetail = useMemo(
    () => (sub: Model.Subscription) => {
      if (sub.stripe_status === "canceled" || sub.cancel_at !== null) {
        /* I am not 100% sure that these two fields can be inconsistent in this
           way, but for now it is safer to provide the warning unless we start
           seeing it occur in practice. */
        if (sub.stripe_status !== "canceled") {
          console.warn(
            `Subscription ${sub.id} for user ${user.id} has a 'cancel_at' date, but does not have a 'canceled' status.`
          );
        } else if (sub.cancel_at === null) {
          console.warn(
            `Subscription ${sub.id} for user ${user.id} has a 'canceled' status, but does not have a 'cancel_at' date.`
          );
        }
        return (
          <React.Fragment>
            <Tag className={"tag--product"} text={"Canceled"} />
            {!isNil(sub.cancel_at) && (
              <div className={"tag-text"}>{`Valid through ${util.dates.toDisplayDate(sub.cancel_at)}.`}</div>
            )}
          </React.Fragment>
        );
      } else if (sub.status === "expired") {
        return (
          <React.Fragment>
            <Tag className={"tag--product"} text={"Expired"} />
            {!isNil(sub.cancel_at) && (
              <div className={"tag-text"}>{`Expired on ${util.dates.toDisplayDate(sub.current_period_end)}.`}</div>
            )}
          </React.Fragment>
        );
      } else {
        return <Tag className={"tag--product"} text={"Active"} />;
      }
    },
    []
  );

  return (
    <RenderOrSpinner loading={loading}>
      <div {...props} className={classNames("products-manager", props.className)}>
        <h4>{userProduct === null ? "Plans" : "Plan"}</h4>
        <Separator />
        {userProduct === null ? (
          <ProductsList
            products={products}
            extra={(p: Model.Product) => (
              <PrimaryButton small={true} loading={subscribing === p.id} onClick={() => onSubscribe(p)}>
                {"Subscribe"}
              </PrimaryButton>
            )}
          />
        ) : (
          <React.Fragment>
            <Product
              product={userProduct}
              hoverBehavior={false}
              extra={
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
                  {!isNil(subscription) && subscriptionDetail(subscription)}
                </div>
              }
            />
            <PrimaryButton style={{ marginTop: 15 }} loading={managing} onClick={() => onManage()}>
              {"Manage Subscriptions"}
            </PrimaryButton>
          </React.Fragment>
        )}
      </div>
    </RenderOrSpinner>
  );
};

export default ProductsManager;

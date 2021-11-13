import React, { useState, useEffect, useMemo } from "react";
import classNames from "classnames";
import { isNil } from "lodash";

import * as api from "api";
import { users, notifications, models, util } from "lib";

import { Separator, RenderOrSpinner } from "components";
import { PrimaryButton } from "components/buttons";
import { Tag } from "components/tagging";

import ProductsList from "./ProductsList";
import Product from "./Product";

import "./ProductsManager.scss";

type ProductsManagerProps = StandardComponentProps & {
  readonly onSubscribe: (p: Model.Product) => void;
  readonly onManage: () => void;
  readonly subscribing: boolean;
  readonly managing: boolean;
};

const ProductsManager = ({
  onSubscribe,
  onManage,
  subscribing,
  managing,
  ...props
}: ProductsManagerProps): JSX.Element => {
  const [products, setProducts] = useState<Model.Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Model.Subscription | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Model.Product | null>(null);
  const user = users.hooks.useLoggedInUser();

  useEffect(() => {
    setLoading(true);
    api
      .getProducts()
      .then((response: Http.ListResponse<Model.Product>) => setProducts(response.data))
      .catch((e: Error) => notifications.ui.handleBannerRequestError(e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api
      .getSubscription()
      .then((response: { subscription: Model.Subscription | null }) => setSubscription(response.subscription))
      .catch((e: Error) => notifications.ui.handleBannerRequestError(e));
  }, []);

  const userProduct = useMemo(() => {
    return user.product_id !== null && products.length !== 0
      ? models.getModel(products, user.product_id, { modelName: "product" })
      : null;
  }, [products, user]);

  return (
    <RenderOrSpinner loading={loading}>
      <div className={classNames("products-manager", props.className)} style={props.style}>
        <h4>{userProduct === null ? "Plans" : "Plan"}</h4>
        <Separator />
        {userProduct === null ? (
          <React.Fragment>
            <ProductsList
              selectedProduct={selectedProduct === null ? null : selectedProduct.id}
              products={products}
              onChange={(p: Model.Product) => setSelectedProduct(p)}
            />
            <PrimaryButton
              style={{ marginTop: 15 }}
              disabled={selectedProduct === null}
              loading={subscribing}
              onClick={() => {
                if (!isNil(selectedProduct)) {
                  onSubscribe(selectedProduct);
                }
              }}
            >
              {"Subscribe"}
            </PrimaryButton>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Product
              product={userProduct}
              hoverBehavior={false}
              extra={
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
                  {!isNil(subscription) && (subscription.status === "canceled" || subscription.cancel_at !== null) ? (
                    <React.Fragment>
                      <Tag className={"tag--product"} text={"Canceled"} />
                      {!isNil(subscription.cancel_at) && (
                        <div className={"cancelling-text"}>{`Valid through ${util.dates.toDisplayDate(
                          subscription.cancel_at
                        )}.`}</div>
                      )}
                    </React.Fragment>
                  ) : (
                    <Tag className={"tag--product"} text={"Active"} />
                  )}
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

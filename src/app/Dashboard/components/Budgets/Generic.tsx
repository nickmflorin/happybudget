import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { map } from "lodash";

import * as store from "store";
import { model } from "lib";

import { Icon, Pagination, NoData } from "components";
import { PrimaryButtonIconToggle, OrderingButtonIconToggle } from "components/buttons";
import { BudgetDropdownMenu, OrderingDropdownMenu } from "components/dropdowns";
import { Input } from "components/fields";
import { Page } from "components/layout";
import { BudgetEmptyIcon } from "components/svgs";

export type RenderGenericCardParams<B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget> = {
  readonly budget: B;
  readonly onClick: () => void;
};

export type GenericProps<B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget> = {
  readonly title: string;
  readonly noDataTitle: string;
  readonly noDataSubTitle?: string;
  readonly ordering: Http.Ordering<string>;
  readonly search: string;
  readonly pageSize: number;
  readonly page: number;
  readonly count: number;
  readonly loading: boolean;
  readonly responseWasReceived: boolean;
  readonly budgets: B[];
  readonly renderCard: (p: RenderGenericCardParams<B>) => JSX.Element;
  readonly onUpdatePagination: (p: Pagination) => void;
  readonly onUpdateOrdering: (o: Redux.UpdateOrderingPayload) => void;
  readonly onSearch: (v: string) => void;
  readonly onCreate: () => void;
};

const Generic = <B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget>(
  props: GenericProps<B>
): JSX.Element => {
  const user = store.hooks.useLoggedInUser();
  const history = useHistory();

  const dispatch: Redux.Dispatch = useDispatch();

  return (
    <Page
      pageProps={{ className: "dashboard-page" }}
      className={"budgets"}
      loading={props.loading}
      title={props.title}
      contentScrollable={true}
      subMenu={[
        <Input
          key={0}
          placeholder={"Search Projects..."}
          value={props.search}
          allowClear={true}
          prefix={<Icon icon={"search"} weight={"light"} />}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.onSearch(event.target.value)}
        />,
        <BudgetDropdownMenu
          key={1}
          onNewBudget={() => {
            /* Note: Normally we would want to rely on a request to the backend
                 as the source of truth for a user permission related action, but
                 since the CreateBudgetModal protects against users without the
                 proper permissions creating multiple budgets during the API
                 request anyways, this is okay. */
            if (
              user.num_budgets !== 0 &&
              !model.user.userHasPermission(user, model.user.Permissions.MULTIPLE_BUDGETS)
            ) {
              dispatch(store.actions.setProductPermissionModalOpenAction(true));
            } else {
              props.onCreate();
            }
          }}
        >
          <PrimaryButtonIconToggle
            breakpoint={"medium"}
            icon={<Icon icon={"plus"} weight={"regular"} />}
            text={"Create Budget"}
          />
        </BudgetDropdownMenu>,
        <OrderingDropdownMenu
          key={2}
          ordering={props.ordering}
          onChange={(field: string, order: Http.Order) => props.onUpdateOrdering({ field, order })}
          models={[
            { id: "created_at", icon: "bars-sort", label: "Created" },
            { id: "updated_at", icon: "timer", label: "Last Updated" },
            { id: "name", icon: "sort-alpha-down", label: "Name" }
          ]}
        >
          <OrderingButtonIconToggle
            breakpoint={"medium"}
            ordering={props.ordering}
            labelMap={{
              created_at: "Created",
              updated_at: "Last Updated",
              name: "Name"
            }}
          />
        </OrderingDropdownMenu>
      ]}
    >
      {props.budgets.length === 0 && props.responseWasReceived ? (
        <NoData
          title={props.noDataTitle}
          subTitle={props.noDataSubTitle}
          icon={<Icon icon={"plus"} weight={"light"} />}
        >
          <BudgetEmptyIcon />
        </NoData>
      ) : (
        <div className={"dashboard-card-grid"}>
          {map(props.budgets, (budget: B, index: number) => (
            <React.Fragment key={index}>
              {props.renderCard({
                budget,
                onClick: () => history.push(`/budgets/${budget.id}`)
              })}
            </React.Fragment>
          ))}
        </div>
      )}
      {props.budgets.length !== 0 && props.responseWasReceived && (
        <Page.Footer>
          <Pagination
            hideOnSinglePage={true}
            defaultPageSize={100}
            pageSize={props.pageSize}
            current={props.page}
            total={props.count}
            onChange={(pg: number) => props.onUpdatePagination({ page: pg })}
          />
        </Page.Footer>
      )}
    </Page>
  );
};

export default Generic;

import React, { useMemo } from "react";

import { isNil, map } from "lodash";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { Icon, Pagination, NoData, NoDataProps } from "components";
import { OrderingButtonIconToggle } from "components/buttons";
import { OrderingDropdownMenu } from "components/dropdowns";
import { Input } from "components/fields";
import { Page } from "components/layout";

const selectBudgets = <
  B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate,
>(
  state: Redux.AuthenticatedApiModelListStore<B>,
) => state.data;

const selectLoading = <
  B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate,
>(
  state: Redux.AuthenticatedApiModelListStore<B>,
) => state.loading;

const selectSearch = <
  B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate,
>(
  state: Redux.AuthenticatedApiModelListStore<B>,
) => state.search;

const selectOrdering = <
  B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate,
>(
  state: Redux.AuthenticatedApiModelListStore<B>,
) => state.ordering;

const selectPageSize = <
  B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate,
>(
  state: Redux.AuthenticatedApiModelListStore<B>,
) => state.pageSize;

const selectPage = <
  B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate,
>(
  state: Redux.AuthenticatedApiModelListStore<B>,
) => state.page;

const selectCount = <
  B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate,
>(
  state: Redux.AuthenticatedApiModelListStore<B>,
) => state.count;

const selectResponseWasReceived = <
  B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate,
>(
  state: Redux.AuthenticatedApiModelListStore<B>,
) => state.responseWasReceived;

export type RenderDashboardPageCardParams<
  B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate,
> = {
  readonly budget: B;
  readonly onClick: () => void;
};

export type DashboardPageProps<
  B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate,
> = {
  readonly title: string;
  readonly noDataProps?: Omit<NoDataProps, "icon"> & { readonly child: JSX.Element };
  readonly searchPlaceholder?: string;
  readonly createMenuElement?: JSX.Element;
  readonly lastCard?: (b: B[]) => JSX.Element;
  readonly selector: (state: Application.Store) => Redux.AuthenticatedApiModelListStore<B>;
  readonly onUpdateOrdering: (o: Redux.UpdateOrderingPayload) => void;
  readonly renderCard: (p: RenderDashboardPageCardParams<B>) => JSX.Element;
  readonly onSearch: (v: string) => void;
  readonly onUpdatePagination: (p: Pagination) => void;
};

const OrderingMenu = <
  B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate,
>(
  props: Pick<DashboardPageProps<B>, "onUpdateOrdering"> & {
    readonly ordering: Http.Ordering<string>;
  },
): JSX.Element => (
  <OrderingDropdownMenu
    ordering={props.ordering}
    onChange={(field: string, order: Http.Order) => props.onUpdateOrdering({ field, order })}
    models={[
      { id: "created_at", icon: "bars-sort", label: "Created" },
      { id: "updated_at", icon: "timer", label: "Last Updated" },
      { id: "name", icon: "sort-alpha-down", label: "Name" },
    ]}
  >
    <OrderingButtonIconToggle
      breakpoint="medium"
      ordering={props.ordering}
      labelMap={{
        created_at: "Created",
        updated_at: "Last Updated",
        name: "Name",
      }}
    />
  </OrderingDropdownMenu>
);

const SearchInput = <
  B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate,
>(
  props: Pick<DashboardPageProps<B>, "searchPlaceholder" | "onSearch"> & {
    readonly search: string;
  },
): JSX.Element => (
  <Input
    placeholder={props.searchPlaceholder || "Search Projects..."}
    value={props.search}
    allowClear={true}
    prefix={<Icon icon="search" weight="light" />}
    onChange={(event: React.ChangeEvent<HTMLInputElement>) => props.onSearch(event.target.value)}
  />
);

const DashboardPage = <
  B extends Model.SimpleBudget | Model.SimpleCollaboratingBudget | Model.SimpleTemplate,
>(
  props: DashboardPageProps<B>,
): JSX.Element => {
  const history = useHistory();

  const budgets = useSelector((s: Application.Store) => selectBudgets(props.selector(s)));
  const loading = useSelector((s: Application.Store) => selectLoading(props.selector(s)));
  const search = useSelector((s: Application.Store) => selectSearch(props.selector(s)));
  const ordering = useSelector((s: Application.Store) => selectOrdering(props.selector(s)));
  const count = useSelector((s: Application.Store) => selectCount(props.selector(s)));
  const pageSize = useSelector((s: Application.Store) => selectPageSize(props.selector(s)));
  const page = useSelector((s: Application.Store) => selectPage(props.selector(s)));
  const responseWasReceived = useSelector((s: Application.Store) =>
    selectResponseWasReceived(props.selector(s)),
  );

  const subMenu = useMemo(
    () => [
      <SearchInput
        key={0}
        search={search}
        searchPlaceholder={props.searchPlaceholder}
        onSearch={props.onSearch}
      />,
      <React.Fragment key={1}>{props.createMenuElement}</React.Fragment>,
      <OrderingMenu key={2} ordering={ordering} onUpdateOrdering={props.onUpdateOrdering} />,
    ],
    [
      search,
      props.searchPlaceholder,
      props.onSearch,
      props.createMenuElement,
      props.onUpdateOrdering,
      ordering,
    ],
  );

  return (
    <Page
      pageProps={{ className: "dashboard-page" }}
      loading={loading}
      title={props.title}
      contentScrollable={true}
      subMenu={subMenu}
    >
      {budgets.length === 0 && responseWasReceived && !isNil(props.noDataProps) ? (
        <NoData {...props.noDataProps} icon={<Icon icon="plus" weight="light" />}>
          {props.noDataProps.child}
        </NoData>
      ) : (
        <div className="dashboard-card-grid">
          {map(budgets, (budget: B, index: number) => (
            <React.Fragment key={index}>
              {props.renderCard({
                budget,
                onClick: () => history.push(`/${budget.domain}s/${budget.id}`),
              })}
            </React.Fragment>
          ))}
          {props.lastCard?.(budgets)}
        </div>
      )}
      {budgets.length !== 0 && responseWasReceived && (
        <Page.Footer>
          <Pagination
            hideOnSinglePage={true}
            defaultPageSize={100}
            pageSize={pageSize}
            current={page}
            total={count}
            onChange={(pg: number) => props.onUpdatePagination({ page: pg })}
          />
        </Page.Footer>
      )}
    </Page>
  );
};

export default React.memo(DashboardPage) as typeof DashboardPage;

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { isNil, map } from "lodash";
import { Pagination } from "antd";

import * as api from "api";
import * as store from "store";
import { redux, notifications, users } from "lib";

import { Icon } from "components";
import { PrimaryButtonIconToggle, OrderingButtonIconToggle } from "components/buttons";
import { BudgetCard } from "components/cards";
import { BudgetDropdown, OrderingDropdown } from "components/dropdowns";
import { NoData } from "components/empty";
import { Input } from "components/fields";
import { Page } from "components/layout";
import { EditBudgetModal, DeleteBudgetModal, CreateBudgetModal } from "components/modals";
import { BudgetEmptyIcon } from "components/svgs";

import { actions } from "../store";

const selectBudgets = (state: Application.AuthenticatedStore) => state.dashboard.budgets.data;
const selectBudgetsResponseReceived = (state: Application.AuthenticatedStore) =>
  state.dashboard.budgets.responseWasReceived;
const selectLoadingBudgets = (state: Application.AuthenticatedStore) => state.dashboard.budgets.loading;
const selectBudgetPage = (state: Application.AuthenticatedStore) => state.dashboard.budgets.page;
const selectBudgetPageSize = (state: Application.AuthenticatedStore) => state.dashboard.budgets.pageSize;
const selectBudgetsCount = (state: Application.AuthenticatedStore) => state.dashboard.budgets.count;
const selectBudgetsSearch = (state: Application.AuthenticatedStore) => state.dashboard.budgets.search;
const selectBudgetsOrdering = (state: Application.AuthenticatedStore) => state.dashboard.budgets.ordering;

const Budgets = (): JSX.Element => {
  const user = users.hooks.useLoggedInUser();
  const [isDeleting, setDeleting, setDeleted] = redux.hooks.useTrackModelActions([]);
  const [isDuplicating, setDuplicating, setDuplicated] = redux.hooks.useTrackModelActions([]);

  const [budgetToEdit, setBudgetToEdit] = useState<number | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Model.SimpleBudget | null>(null);
  const [createBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);
  const history = useHistory();

  const dispatch: Redux.Dispatch = useDispatch();
  const budgets = useSelector(selectBudgets);
  const loading = useSelector(selectLoadingBudgets);
  const responseWasReceived = useSelector(selectBudgetsResponseReceived);
  const page = useSelector(selectBudgetPage);
  const pageSize = useSelector(selectBudgetPageSize);
  const count = useSelector(selectBudgetsCount);
  const search = useSelector(selectBudgetsSearch);
  const ordering = useSelector(selectBudgetsOrdering);

  useEffect(() => {
    dispatch(actions.requestBudgetsAction(null));
  }, []);

  return (
    <React.Fragment>
      <Page
        pageProps={{ className: "dashboard-page" }}
        className={"budgets"}
        loading={loading}
        title={"My Budgets"}
        contentScrollable={true}
        subMenu={[
          <Input
            key={0}
            placeholder={"Search Projects..."}
            value={search}
            allowClear={true}
            prefix={<Icon icon={"search"} weight={"light"} />}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              dispatch(actions.setBudgetsSearchAction(event.target.value, {}))
            }
          />,
          <BudgetDropdown
            onNewBudget={() => {
              /* Note: Normally we would want to rely on a request to the backend
                 as the source of truth for a user permission related action, but
                 since the CreateBudgetModal protects against users without the
                 proper permissions creating multiple budgets during the API
                 request anyways, this is okay. */
              if (
                responseWasReceived &&
                budgets.length !== 0 &&
                !users.permissions.userHasPermission(user, users.permissions.Permissions.MULTIPLE_BUDGETS)
              ) {
                dispatch(store.actions.authenticated.setProductPermissionModalOpenAction(true));
              } else if (responseWasReceived) {
                setCreateBudgetModalOpen(true);
              }
            }}
            key={1}
          >
            <PrimaryButtonIconToggle
              breakpoint={"medium"}
              icon={<Icon icon={"plus"} weight={"light"} />}
              text={"Create Budget"}
            />
          </BudgetDropdown>,
          <OrderingDropdown
            key={2}
            ordering={ordering}
            onChange={(field: string, order: Http.Order) =>
              dispatch(actions.updateBudgetsOrderingAction({ field, order }))
            }
            models={[
              { id: "created_at", icon: "bars-sort", label: "Created" },
              { id: "updated_at", icon: "timer", label: "Last Updated" },
              { id: "name", icon: "sort-alpha-down", label: "Name" }
            ]}
          >
            <OrderingButtonIconToggle
              key={3}
              ordering={ordering}
              labelMap={{
                created_at: "Created",
                updated_at: "Last Updated",
                name: "Name"
              }}
            />
          </OrderingDropdown>
        ]}
      >
        {budgets.length === 0 && responseWasReceived ? (
          <NoData
            title={"You don't have any templates yet! Create a new budget."}
            subTitle={
              // eslint-disable-next-line quotes
              'Tip: Click the "Create Budget" button above and create an empty budget or start one from a template.'
            }
            icon={<Icon icon={"plus"} weight={"light"} />}
          >
            <BudgetEmptyIcon />
          </NoData>
        ) : (
          <div className={"dashboard-card-grid"}>
            {map(budgets, (budget: Model.SimpleBudget, index: number) => {
              return (
                <BudgetCard
                  key={index}
                  budget={budget}
                  disabled={isDeleting(budget.id)}
                  duplicating={isDuplicating(budget.id)}
                  onClick={() => history.push(`/budgets/${budget.id}`)}
                  onEdit={() => setBudgetToEdit(budget.id)}
                  onDelete={() => setBudgetToDelete(budget)}
                  onDuplicate={(e: MenuItemModelClickEvent) => {
                    /* Note: Normally we would want to rely on a request to the
										   backend as the source of truth for a user permission
											 related action, but since the request to duplicate a
											 Budget is itself protected against incompatible
											 permissions, this is okay. */
                    if (
                      responseWasReceived &&
                      budgets.length !== 0 &&
                      !users.permissions.userHasPermission(user, users.permissions.Permissions.MULTIPLE_BUDGETS)
                    ) {
                      dispatch(store.actions.authenticated.setProductPermissionModalOpenAction(true));
                      /* Edge case, since a response would have to had been
											   received if there is a card there. */
                    } else if (responseWasReceived) {
                      setDuplicating(budget.id);
                      api
                        .duplicateBudget(budget.id)
                        .then((response: Model.Budget) => {
                          e.closeParentDropdown?.();
                          dispatch(actions.addBudgetToStateAction(response));
                        })
                        .catch((err: Error) => {
                          if (
                            err instanceof api.ClientError &&
                            !isNil(err.permissionError) &&
                            err.permissionError.code === api.ErrorCodes.PRODUCT_PERMISSION_ERROR
                          ) {
                            /* Edge case, since we would prevent this action
                               if this were the case before submitting the
															 request. */
                            notifications.ui.banner.lookupAndNotify("budgetCountPermissionError", {});
                          } else {
                            notifications.ui.banner.handleRequestError(err);
                          }
                        })
                        .finally(() => setDuplicated(budget.id));
                    }
                  }}
                />
              );
            })}
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
              onChange={(pg: number) => {
                dispatch(actions.setBudgetsPaginationAction({ page: pg }));
              }}
            />
          </Page.Footer>
        )}
      </Page>
      {!isNil(budgetToEdit) && (
        <EditBudgetModal
          open={true}
          id={budgetToEdit}
          onCancel={() => setBudgetToEdit(null)}
          onSuccess={(budget: Model.Budget) => {
            setBudgetToEdit(null);
            dispatch(actions.updateBudgetInStateAction({ id: budget.id, data: budget }));
          }}
        />
      )}
      {createBudgetModalOpen === true && (
        <CreateBudgetModal
          open={true}
          onCancel={() => setCreateBudgetModalOpen(false)}
          onSuccess={(budget: Model.Budget) => {
            dispatch(actions.addBudgetToStateAction(budget));
            setCreateBudgetModalOpen(false);
            history.push(`/budgets/${budget.id}/accounts`);
          }}
        />
      )}
      {!isNil(budgetToDelete) && (
        <DeleteBudgetModal
          open={true}
          onCancel={() => setBudgetToDelete(null)}
          onOk={() => {
            setBudgetToDelete(null);
            setDeleting(budgetToDelete.id);
            api
              .deleteBudget(budgetToDelete.id)
              .then(() => {
                dispatch(actions.removeBudgetFromStateAction(budgetToDelete.id));
                dispatch(actions.requestPermissioningBudgetsAction(null));
              })
              .catch((err: Error) => notifications.requestError(err))
              .finally(() => {
                setDeleted(budgetToDelete.id);
              });
          }}
          budget={budgetToDelete}
        />
      )}
    </React.Fragment>
  );
};

export default Budgets;

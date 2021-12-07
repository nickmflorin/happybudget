import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { map, isNil } from "lodash";
import { Pagination } from "antd";

import * as api from "api";
import { redux, notifications } from "lib";

import { Icon } from "components";
import { Button, CircleIconButton } from "components/buttons";
import { BudgetCard } from "components/cards";
import { NoBudgets } from "components/empty";
import { Input } from "components/fields";
import { Page } from "components/layout";
import { EditBudgetModal, DeleteBudgetModal, CreateBudgetModal } from "components/modals";
import { BudgetEmptyIcon } from "components/svgs";

import { actions } from "../../store";
import BudgetDropdown from "./BudgetDropdown";
import "./index.scss";

const selectBudgets = (state: Application.Authenticated.Store) => state.dashboard.budgets.data;
const selectBudgetsResponseReceived = (state: Application.Authenticated.Store) =>
  state.dashboard.budgets.responseWasReceived;
const selectLoadingBudgets = (state: Application.Authenticated.Store) => state.dashboard.budgets.loading;
const selectBudgetPage = (state: Application.Authenticated.Store) => state.dashboard.budgets.page;
const selectBudgetPageSize = (state: Application.Authenticated.Store) => state.dashboard.budgets.pageSize;
const selectBudgetsCount = (state: Application.Authenticated.Store) => state.dashboard.budgets.count;
const selectBudgetsSearch = (state: Application.Authenticated.Store) => state.dashboard.budgets.search;

const Budgets = (): JSX.Element => {
  const [isDeleting, setDeleting, setDeleted] = redux.hooks.useTrackModelActions([]);
  const [isDuplicating, setDuplicating, setDuplicated] = redux.hooks.useTrackModelActions([]);

  const [budgetToEdit, setBudgetToEdit] = useState<number | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Model.Budget | null>(null);
  const [createBudgetModalOpen, setCreateBudgetModalOpen] = useState(false);
  const search = useSelector(selectBudgetsSearch);

  const history = useHistory();

  const dispatch: Redux.Dispatch = useDispatch();
  const budgets = useSelector(selectBudgets);
  const loading = useSelector(selectLoadingBudgets);
  const responseWasReceived = useSelector(selectBudgetsResponseReceived);
  const currentPage = useSelector(selectBudgetPage);
  const currentPageSize = useSelector(selectBudgetPageSize);
  const budgetsCount = useSelector(selectBudgetsCount);

  useEffect(() => {
    dispatch(actions.requestBudgetsAction(null));
  }, []);

  return (
    <React.Fragment>
      <Page
        pageProps={{ className: "budgets-page" }}
        className={"budgets"}
        loading={loading}
        title={"My Budgets"}
        contentScrollable={true}
        subMenu={[
          <Input
            placeholder={"Search Projects..."}
            value={search}
            allowClear={true}
            prefix={<Icon icon={"search"} weight={"light"} />}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              dispatch(actions.setBudgetsSearchAction(event.target.value))
            }
          />,
          <BudgetDropdown onNewBudget={() => setCreateBudgetModalOpen(true)}>
            <CircleIconButton className={"btn--primary"} icon={<Icon icon={"plus"} weight={"light"} />} />
          </BudgetDropdown>,
          <BudgetDropdown onNewBudget={() => setCreateBudgetModalOpen(true)}>
            <Button className={"btn--primary btn-non-circle"} icon={<Icon icon={"plus"} weight={"light"} />}>
              {"Create Budget"}
            </Button>
          </BudgetDropdown>
        ]}
      >
        {budgets.length === 0 && responseWasReceived ? (
          <NoBudgets title={"You don't have any templates yet! Create a new budget."} subTitle>
            <BudgetEmptyIcon />
          </NoBudgets>
        ) : (
          <div className={"dashboard-card-grid"}>
            {map(budgets, (budget: Model.Budget, index: number) => {
              return (
                <BudgetCard
                  key={index}
                  budget={budget}
                  disabled={isDeleting(budget.id)}
                  duplicating={isDuplicating(budget.id)}
                  onClick={() => history.push(`/budgets/${budget.id}`)}
                  onEdit={() => setBudgetToEdit(budget.id)}
                  onDelete={() => setBudgetToDelete(budget)}
                  onDuplicate={(e: MenuItemClickEvent<MenuItemModel>) => {
                    setDuplicating(budget.id);
                    api
                      .duplicateBudget(budget.id)
                      .then((response: Model.Budget) => {
                        e.closeParentDropdown?.();
                        dispatch(actions.addBudgetToStateAction(response));
                      })
                      .catch((err: Error) => notifications.requestError(err))
                      .finally(() => setDuplicated(budget.id));
                  }}
                />
              );
            })}
          </div>
        )}
        {budgets.length !== 0 && responseWasReceived && (
          <Page.Footer>
            <Pagination
              hideOnSinglePage={false}
              showSizeChanger={true}
              defaultPageSize={currentPageSize}
              defaultCurrent={currentPage}
              total={budgetsCount}
              onChange={(page: number, pageSize: number | undefined) => {
                dispatch(actions.setBudgetsPaginationAction(pageSize === undefined ? { page } : { page, pageSize }));
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
          onOk={(e: React.MouseEvent<HTMLElement>) => {
            setBudgetToDelete(null);
            setDeleting(budgetToDelete.id);
            api
              .deleteBudget(budgetToDelete.id)
              .then(() => {
                dispatch(actions.removeBudgetFromStateAction(budgetToDelete.id));
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

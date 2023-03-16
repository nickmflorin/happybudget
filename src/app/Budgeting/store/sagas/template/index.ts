import { SagaIterator } from "redux-saga";
import { spawn, takeLatest } from "redux-saga/effects";

import { tabling } from "lib";
import * as store from "store";

import accountSaga from "./account";
import subAccountSaga from "./subAccount";
import * as actions from "../../actions/template";
import * as selectors from "../../selectors";
import * as tasks from "../tasks";

export * as accounts from "./accounts";
export * as account from "./account";
export * as subAccount from "./subAccount";

const FringesActionMap = {
  handleEvent: actions.handleFringesTableEventAction,
  loading: actions.loadingFringesAction,
  response: actions.responseFringesAction,
  updateBudgetInState: actions.updateBudgetInStateAction,
  setSearch: actions.setFringesSearchAction,
};

export const createFringesTableSaga = (
  table: Table.TableInstance<Tables.FringeRowData, Model.Fringe>,
) =>
  tabling.sagas.createAuthenticatedTableSaga<
    Tables.FringeRowData,
    Model.Fringe,
    Tables.FringeTableStore,
    FringesTableActionContext<Model.Template, Model.Account | Model.SubAccount, false>
  >({
    actions: FringesActionMap,
    selectStore: (state: Application.Store) => state.template.fringes,
    tasks: store.tasks.fringes.createTableTaskSet<Model.Template>({
      table,
      selectBaseStore: (s: Application.Store) => s.template,
      selectParentTableStore: (
        s: Application.Store,
        ctx: FringesTableActionContext<Model.Template, Model.Account | Model.SubAccount, false>,
      ) => selectors.selectSubAccountsTableStore(s, ctx),
      actions: {
        ...FringesActionMap,
        invalidate: {
          account: actions.account.invalidateAccountAction,
          subaccount: actions.subAccount.invalidateSubAccountAction,
          accountSubAccountsTable: actions.account.invalidateAction,
          subaccountSubAccountsTable: actions.subAccount.invalidateAction,
        },
        requestParentTableData: (
          id: number,
          parentType: "account" | "subaccount",
          payload: Redux.TableRequestPayload,
          ctx: Omit<
            FringesTableActionContext<Model.Template, Model.Account | Model.SubAccount, false>,
            "parentId" | "parentType"
          >,
        ): Redux.Action<
          Redux.TableRequestPayload,
          SubAccountsTableActionContext<Model.Template, Model.Account | Model.SubAccount, false>
        > => {
          if (parentType === "account") {
            return actions.account.requestAction(payload, {
              parentId: id,
              parentType,
              domain: ctx.domain,
              public: ctx.public,
              budgetId: ctx.budgetId,
            }) as Redux.Action<
              Redux.TableRequestPayload,
              SubAccountsTableActionContext<Model.Template, Model.Account | Model.SubAccount, false>
            >;
          }
          return actions.subAccount.requestAction(payload, {
            parentId: id,
            parentType: parentType,
            domain: ctx.domain,
            public: ctx.public,
            budgetId: ctx.budgetId,
          }) as Redux.Action<
            Redux.TableRequestPayload,
            SubAccountsTableActionContext<Model.Template, Model.Account | Model.SubAccount, false>
          >;
        },
        requestParent: (
          id: number,
          parentType: "account" | "subaccount",
          payload: Redux.RequestPayload,
          ctx: Omit<
            FringesTableActionContext<Model.Template, Model.Account | Model.SubAccount, false>,
            "parentId" | "parentType"
          >,
        ): Redux.Action<
          Redux.RequestPayload,
          | AccountActionContext<Model.Template, false>
          | SubAccountActionContext<Model.Template, false>
        > => {
          if (parentType === "account") {
            return actions.account.requestAccountAction(payload, {
              id,
              domain: ctx.domain,
              public: ctx.public,
              budgetId: ctx.budgetId,
            }) as Redux.Action<
              Redux.RequestPayload,
              | AccountActionContext<Model.Template, false>
              | SubAccountActionContext<Model.Template, false>
            >;
          }
          return actions.subAccount.requestSubAccountAction(payload, {
            id,
            domain: ctx.domain,
            public: ctx.public,
            budgetId: ctx.budgetId,
          }) as Redux.Action<
            Redux.RequestPayload,
            | AccountActionContext<Model.Template, false>
            | SubAccountActionContext<Model.Template, false>
          >;
        },
      },
    }),
  });

export default function* rootSaga(): SagaIterator {
  yield spawn(accountSaga);
  yield spawn(subAccountSaga);
  yield takeLatest(actions.requestBudgetAction.toString(), tasks.getBudget);
}

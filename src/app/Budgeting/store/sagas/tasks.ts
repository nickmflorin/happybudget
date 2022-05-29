import { SagaIterator } from "redux-saga";
import { put, select } from "redux-saga/effects";

import * as api from "api";
import { notifications, http, redux } from "lib";

import * as actions from "../actions";
import * as selectors from "../selectors";

type ActionTypeLookup<B extends Model.Budget | Model.Template, PUBLIC extends boolean> = {
  readonly domain: B["domain"];
  readonly pub: PUBLIC;
  readonly loadingBudget: Redux.ActionCreator<boolean, BudgetActionContext<B, PUBLIC>>;
  readonly responseBudget: Redux.ActionCreator<Http.RenderedDetailResponse<B>, BudgetActionContext<B, PUBLIC>>;
  // Currently, this action is not wired to anything but may be in the future.
  readonly loadingAccount: Redux.ActionCreator<boolean, AccountActionContext<B, PUBLIC>>;
  readonly responseAccount: Redux.ActionCreator<
    Http.RenderedDetailResponse<Model.Account>,
    AccountActionContext<B, PUBLIC>
  >;
  // Currently, this action is not wired to anything but may be in the future.
  readonly loadingSubAccount: Redux.ActionCreator<boolean, SubAccountActionContext<B, PUBLIC>>;
  readonly responseSubAccount: Redux.ActionCreator<
    Http.RenderedDetailResponse<Model.SubAccount>,
    SubAccountActionContext<B, PUBLIC>
  >;
};

const ACTION_LOOKUPS: [
  ActionTypeLookup<Model.Budget, false>,
  ActionTypeLookup<Model.Template, false>,
  ActionTypeLookup<Model.Budget, true>
] = [
  {
    domain: "budget",
    pub: false,
    loadingBudget: actions.budget.loadingBudgetAction,
    responseBudget: actions.budget.responseBudgetAction,
    loadingAccount: actions.budget.account.loadingAccountAction,
    responseAccount: actions.budget.account.responseAccountAction,
    loadingSubAccount: actions.budget.subAccount.loadingSubAccountAction,
    responseSubAccount: actions.budget.subAccount.responseSubAccountAction
  },
  {
    domain: "template",
    pub: false,
    loadingBudget: actions.template.loadingBudgetAction,
    responseBudget: actions.template.responseBudgetAction,
    loadingAccount: actions.template.account.loadingAccountAction,
    responseAccount: actions.template.account.responseAccountAction,
    loadingSubAccount: actions.template.subAccount.loadingSubAccountAction,
    responseSubAccount: actions.template.subAccount.responseSubAccountAction
  },
  {
    domain: "budget",
    pub: true,
    loadingBudget: actions.pub.loadingBudgetAction,
    responseBudget: actions.pub.responseBudgetAction,
    loadingAccount: actions.pub.account.loadingAccountAction,
    responseAccount: actions.pub.account.responseAccountAction,
    loadingSubAccount: actions.pub.subAccount.loadingSubAccountAction,
    responseSubAccount: actions.pub.subAccount.responseSubAccountAction
  }
];

const isActionLookupOfType = <B extends Model.Budget | Model.Template, PUBLIC extends boolean>(
  /* eslint-disable @typescript-eslint/no-explicit-any */
  lookup: ActionTypeLookup<any, any>,
  domain: B["domain"],
  pub: PUBLIC
): lookup is ActionTypeLookup<B, PUBLIC> =>
  (lookup as ActionTypeLookup<B, PUBLIC>).domain === domain && (lookup as ActionTypeLookup<B, PUBLIC>).pub === pub;

const getLookup = <B extends Model.Budget | Model.Template, PUBLIC extends boolean>(
  domain: B["domain"],
  pub: PUBLIC
): ActionTypeLookup<B, PUBLIC> => {
  for (let i = 0; i < ACTION_LOOKUPS.length; i++) {
    const lookup = ACTION_LOOKUPS[i];
    if (isActionLookupOfType(lookup, domain, pub)) {
      return lookup;
    }
  }
  throw new Error(`Action lookup not mapped for domain=${domain}, public=${String(pub)}.`);
};

export function* getBudget(action: Redux.Action<Redux.RequestPayload, BudgetActionContext>): SagaIterator {
  /*
	Unlike the requests to get a SubAccount or an Account, we do not need to
	be concerned with only performing the request in the case that the Budget
	was not already requested and put in the store because in every case, the
	request to get the Budget should use a fresh request as it is performed at
	the top level of the component hierarchy and only performed when a URL
	indexed by /budgets/<id> is first loaded.
	*/
  const lookup = getLookup(action.context.domain, action.context.public);

  yield put(lookup.loadingBudget(true, action.context));
  try {
    const response: Model.Budget = yield http.request(api.getBudget, action.context, action.context.budgetId);
    yield put(lookup.responseBudget(response, action.context));
  } catch (e: unknown) {
    const err = e as Error;
    if (
      action.context.domain === "budget" &&
      action.context.public === false &&
      err instanceof api.PermissionError &&
      err.code === api.ErrorCodes.permission.PRODUCT_PERMISSION_ERROR
    ) {
      notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
    } else {
      notifications.ui.banner.handleRequestError(err);
    }
    /* Non api.RequestError will be thrown in the above block so this coercion
       is safe. */
    yield put(lookup.responseBudget({ error: e as api.RequestError }, action.context));
  } finally {
    yield put(lookup.loadingBudget(false, action.context));
  }
}

export function* getAccount(action: Redux.Action<Redux.RequestPayload, AccountActionContext>): SagaIterator {
  // Only perform the request if the data is not already in the store.
  const exists = yield select((s: Application.Store) => {
    return redux.canUseCachedIndexedDetailResponse(
      selectors.selectIndexedAccounts(s, action.context),
      (si: Modules.AccountOrSubAccountStore<Model.Account>) => si.detail,
      action.context.id
    );
  });
  if (!exists || redux.requestActionIsForced(action)) {
    const lookup = getLookup(action.context.domain, action.context.public);
    yield put(lookup.loadingAccount(true, action.context));
    try {
      const response: Model.Account = yield http.request(api.getAccount, action.context, action.context.id);
      yield put(lookup.responseAccount(response, action.context));
    } catch (e: unknown) {
      const err = e as Error;
      if (
        action.context.domain === "budget" &&
        action.context.public === false &&
        err instanceof api.PermissionError &&
        err.code === api.ErrorCodes.permission.PRODUCT_PERMISSION_ERROR
      ) {
        notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
      } else {
        notifications.ui.banner.handleRequestError(err);
      }
      /* Non api.RequestError will be thrown in the above block so this coercion
         is safe. */
      yield put(lookup.responseAccount({ error: e as api.RequestError }, action.context));
    } finally {
      yield put(lookup.loadingAccount(false, action.context));
    }
  }
}

export function* getSubAccount(action: Redux.Action<Redux.RequestPayload, SubAccountActionContext>): SagaIterator {
  // Only perform the request if the data is not already in the store.
  const exists = yield select((s: Application.Store) => {
    return redux.canUseCachedIndexedDetailResponse(
      selectors.selectIndexedSubAccounts(s, action.context),
      (si: Modules.AccountOrSubAccountStore<Model.SubAccount>) => si.detail,
      action.context.id
    );
  });
  if (!exists || redux.requestActionIsForced(action)) {
    const lookup = getLookup(action.context.domain, action.context.public);
    yield put(lookup.loadingSubAccount(true, action.context));
    try {
      const response: Model.SubAccount = yield http.request(api.getSubAccount, action.context, action.context.id);
      yield put(lookup.responseSubAccount(response, action.context));
    } catch (e: unknown) {
      const err = e as Error;
      if (
        action.context.domain === "budget" &&
        action.context.public === false &&
        err instanceof api.PermissionError &&
        err.code === api.ErrorCodes.permission.PRODUCT_PERMISSION_ERROR
      ) {
        notifications.ui.banner.lookupAndNotify("budgetSubscriptionPermissionError");
      } else {
        notifications.ui.banner.handleRequestError(err);
      }
      /* Non api.RequestError will be thrown in the above block so this coercion
         is safe. */
      yield put(lookup.responseSubAccount({ error: e as api.RequestError }, action.context));
    } finally {
      yield put(lookup.loadingSubAccount(false, action.context));
    }
  }
}

import { Reducer } from "redux";
import { isNil, find, includes, map, filter, reduce, forEach } from "lodash";

import * as models from "lib/model";
import { createModelListResponseReducer } from "lib/redux/factories";
import { warnInconsistentState } from "lib/redux/util";
import * as typeguards from "lib/model/typeguards";
import { fringeValue, consolidateTableChange } from "lib/model/util";
import { replaceInArray } from "lib/util";

import { initialModelListResponseState } from "store/initialState";
import { ActionType } from "../actions";

export const createFringesReducer = <D extends Modules.Budgeting.BudgetDirective>(
  /* eslint-disable indent */
  directive: D
): Reducer<Redux.ModelListResponseStore<Model.Fringe>, Redux.Action<any>> => {
  const listResponseReducer = createModelListResponseReducer<Model.Fringe, Redux.ModelListResponseStore<Model.Fringe>>(
    {
      Response: ActionType[directive].Fringes.Response,
      Loading: ActionType[directive].Fringes.Loading,
      SetSearch: ActionType[directive].Fringes.SetSearch,
      UpdateInState: ActionType[directive].Fringes.UpdateInState,
      RemoveFromState: ActionType[directive].Fringes.RemoveFromState,
      AddToState: ActionType[directive].Fringes.AddToState,
      Select: ActionType[directive].Fringes.Select,
      Deselect: ActionType[directive].Fringes.Deselect,
      SelectAll: ActionType[directive].Fringes.SelectAll,
      Deleting: ActionType[directive].Fringes.Deleting,
      Updating: ActionType[directive].Fringes.Updating,
      Creating: ActionType[directive].Fringes.Creating
    },
    {
      strictSelect: false,
      initialState: initialModelListResponseState
    }
  );
  return (
    state: Redux.ModelListResponseStore<Model.Fringe> = initialModelListResponseState,
    action: Redux.Action<any>
  ): Redux.ModelListResponseStore<Model.Fringe> => {
    return listResponseReducer(state, action);
  };
};

interface AccountsGroupsActionMap {
  Response: string;
  Request: string;
  Loading: string;
  RemoveFromState: string;
  UpdateInState: string;
  AddToState: string;
  Deleting: string;
}

interface AccountsHistoryActionMap {
  Response: string;
  Request: string;
  Loading: string;
}

interface AccountsReducerFactoryActionMap {
  TableChanged: string;
  Response: string;
  Request: string;
  Loading: string;
  SetSearch: string;
  RemoveFromState: string;
  AddToState: string;
  Select: string;
  Deselect: string;
  SelectAll: string;
  RemoveFromGroup: string;
  AddToGroup: string;
  Creating: string;
  Updating: string;
  Deleting: string;
  Groups: AccountsGroupsActionMap;
  History?: AccountsHistoryActionMap;
}

const recalculateGroupMetrics = <
  S extends Modules.Budgeting.AccountsStore<M, G> | Modules.Budgeting.SubAccountsStore<M, G>,
  M extends Model.BudgetAccount | Model.TemplateAccount | Model.BudgetSubAccount | Model.TemplateSubAccount,
  G extends Model.Group
>(
  /* eslint-disable indent */
  action: Redux.Action<any>,
  st: S,
  groupId: number
): S => {
  // This might not be totally necessary, but it is good practice to not use the entire payload
  // to update the group (since that is already done by the reducer above) but to instead just
  // update the parts of the relevant parts of the current group in state (estimated, variance,
  // actual).
  const group: G | undefined = find(st.groups.data, { id: groupId } as any);
  if (isNil(group)) {
    warnInconsistentState({
      action: action.type,
      reason: "Group does not exist in state when it is expected to.",
      id: groupId
    });
    return st;
  }
  const objs = filter(
    map(group.children, (id: number) => {
      const obj = find(st.data, { id });
      if (!isNil(obj)) {
        return obj;
      } else {
        warnInconsistentState({
          action: action.type,
          reason: "Group child account/sub-account does not exist in state when it is expected to.",
          id: id,
          groupId: group.id
        });
        return null;
      }
    }),
    (child: M | null) => child !== null
  ) as M[];
  let payload: any = {
    estimated: reduce(objs, (sum: number, s: M) => sum + (s.estimated || 0), 0)
  };
  if (typeguards.isBudgetGroup(group)) {
    const budgetAccounts = objs as (Model.BudgetAccount | Model.BudgetSubAccount)[];
    const actual = reduce(
      budgetAccounts,
      (sum: number, s: Model.BudgetAccount | Model.BudgetSubAccount) => sum + (s.actual || 0),
      0
    );
    payload = { ...payload, actual, variance: payload.estimated - actual };
  }
  return {
    ...st,
    groups: {
      ...st.groups,
      data: replaceInArray<G>(st.groups.data, { id: group.id }, { ...group, ...payload })
    }
  };
};

export const createAccountsReducer = <
  S extends Modules.Budgeting.AccountsStore<A, G>,
  R extends Table.Row,
  A extends Model.BudgetAccount | Model.TemplateAccount,
  G extends Model.Group
>(
  /* eslint-disable indent */
  mapping: AccountsReducerFactoryActionMap,
  manager: models.RowManager<R, A, Http.SubAccountPayload>,
  initialState: S
): Reducer<S, Redux.Action<any>> => {
  let historySubReducers = {};
  if (!isNil(mapping.History)) {
    historySubReducers = {
      history: createModelListResponseReducer<Model.HistoryEvent>({
        Response: mapping.History.Response,
        Request: mapping.History.Request,
        Loading: mapping.History.Loading
      })
    };
  }
  const listResponseReducer = createModelListResponseReducer<A, S>(
    {
      Response: mapping.Response,
      Request: mapping.Request,
      Loading: mapping.Loading,
      SetSearch: mapping.SetSearch,
      RemoveFromState: mapping.RemoveFromState,
      AddToState: mapping.AddToState,
      Select: mapping.Select,
      Deselect: mapping.Deselect,
      SelectAll: mapping.SelectAll,
      Deleting: mapping.Deleting,
      Updating: mapping.Updating,
      Creating: mapping.Creating
    },
    {
      initialState,
      strictSelect: false,
      subReducers: {
        ...historySubReducers,
        groups: createModelListResponseReducer<G, Redux.ModelListResponseStore<G>>({
          Response: mapping.Groups.Response,
          Request: mapping.Groups.Request,
          Loading: mapping.Groups.Loading,
          RemoveFromState: mapping.Groups.RemoveFromState,
          AddToState: mapping.Groups.AddToState,
          UpdateInState: mapping.Groups.UpdateInState,
          Deleting: mapping.Groups.Deleting
        })
      }
    }
  );

  return (state: S = initialState, action: Redux.Action<any>): S => {
    let newState = { ...state };

    newState = listResponseReducer(newState, action);

    // NOTE: The above ListResponseReducer handles updates to the Group itself or the SubAccount itself
    // via these same actions. However, it does not do any recalculation of the group values, because
    // it needs the state of the Group and the state of the SubAccount(s) to do so. This means moving
    // that logic/recalculation further up the reducer tree where we have access to the SubAccount(s)
    // in state.
    if (action.type === mapping.Groups.UpdateInState) {
      const group: G = action.payload;
      newState = recalculateGroupMetrics<S, A, G>(action, newState, group.id);
    } else if (action.type === mapping.TableChanged) {
      const consolidated = consolidateTableChange(action.payload);
      for (let i = 0; i < consolidated.length; i++) {
        let account: A | null = find(newState.data, { id: consolidated[i].id } as any) || null;
        if (isNil(account)) {
          warnInconsistentState({
            action: action.type,
            reason: "Account does not exist in state when it is expected to.",
            id: consolidated[i].id
          });
        } else {
          account = manager.mergeChangesWithModel(account, consolidated[i]);
          if (!isNil(account.group)) {
            newState = recalculateGroupMetrics<S, A, G>(action, newState, account.group);
          } else {
            newState = {
              ...newState,
              data: replaceInArray<A>(newState.data, { id: account.id }, account)
            };
          }
        }
      }
    } else if (action.type === mapping.Groups.AddToState) {
      const group: G = action.payload;
      forEach(group.children, (simpleAccount: number) => {
        const account: A | undefined = find(newState.data, { id: simpleAccount } as any);
        if (isNil(account)) {
          warnInconsistentState({
            action: action.type,
            reason: "Account does not exist in state for group child.",
            id: simpleAccount,
            groupId: group.id
          });
        } else {
          newState = {
            ...newState,
            data: replaceInArray<A>(newState.data, { id: simpleAccount }, { ...account, group: group.id })
          };
        }
      });
    } else if (action.type === mapping.Groups.RemoveFromState) {
      // NOTE: Here, we cannot look at the group that was removed from state because the action
      // only includes the group ID and the group was already removed from state.  Instead, we will
      // clear the group for any Account that belongs to a group no longer in state.
      forEach(newState.data, (account: A) => {
        if (!isNil(account.group)) {
          const group: G | undefined = find(newState.groups.data, { id: account.group } as any);
          if (isNil(group)) {
            newState = {
              ...newState,
              data: replaceInArray<A>(newState.data, { id: account.id }, { ...account, group: null })
            };
          }
        }
      });
    } else if (action.type === mapping.RemoveFromGroup || action.type === mapping.RemoveFromState) {
      const group: G | undefined = find(newState.groups.data, (g: G) => includes(g.children, action.payload));
      if (isNil(group)) {
        warnInconsistentState({
          action: action.type,
          reason: "Group does not exist for account.",
          id: action.payload
        });
      } else {
        newState = {
          ...newState,
          groups: {
            ...newState.groups,
            data: replaceInArray<G>(
              newState.groups.data,
              { id: group.id },
              { ...group, children: filter(group.children, (child: number) => child !== action.payload) }
            )
          }
        };
        newState = recalculateGroupMetrics<S, A, G>(action, newState, group.id);
      }
    } else if (action.type === mapping.AddToGroup) {
      const group: G | undefined = find(newState.groups.data, { id: action.payload.group });
      if (isNil(group)) {
        warnInconsistentState({
          action: action.type,
          reason: "Group does not exist for account.",
          id: action.payload
        });
      } else {
        newState = {
          ...newState,
          groups: {
            ...newState.groups,
            data: replaceInArray<G>(
              newState.groups.data,
              { id: group.id },
              { ...group, children: [...group.children, action.payload.id] }
            )
          }
        };
        newState = recalculateGroupMetrics<S, A, G>(action, newState, group.id);
      }
    }
    return { ...newState };
  };
};

interface SubAccountsGroupsActionMap {
  Response: string;
  Request: string;
  Loading: string;
  RemoveFromState: string;
  UpdateInState: string;
  AddToState: string;
  Deleting: string;
}

interface SubAccountsHistoryActionMap {
  Response: string;
  Request: string;
  Loading: string;
}

interface SubAccountsFringesActionMap {
  UpdateInState: string;
}

interface SubAccountsReducerFactoryActionMap {
  TableChanged: string;
  Response: string;
  Request: string;
  Loading: string;
  SetSearch: string;
  RemoveFromState: string;
  AddToState: string;
  Select: string;
  Deselect: string;
  SelectAll: string;
  RemoveFromGroup: string;
  AddToGroup: string;
  Creating: string;
  Updating: string;
  Deleting: string;
  Groups: SubAccountsGroupsActionMap;
  Fringes: SubAccountsFringesActionMap;
  History?: SubAccountsHistoryActionMap;
}

const recalculateSubAccountFromFringes = <
  S extends Modules.Budgeting.SubAccountsStore<SA, G>,
  SA extends Model.BudgetSubAccount | Model.TemplateSubAccount,
  G extends Model.Group
>(
  /* eslint-disable indent */
  action: Redux.Action<any>,
  st: S,
  subAccount: SA
): SA => {
  if (!isNil(subAccount.estimated)) {
    const fringes: Model.Fringe[] = filter(
      map(subAccount.fringes, (id: number) => {
        const fringe: Model.Fringe | undefined = find(st.fringes.data, { id });
        if (!isNil(fringe)) {
          return fringe;
        } else {
          warnInconsistentState({
            action: action.type,
            reason: "Fringe for sub-account does not exist in state when it is expected to.",
            id: id,
            subaccountId: subAccount.id
          });
          return null;
        }
      }),
      (fringe: Model.Fringe | null) => fringe !== null
    ) as Model.Fringe[];
    return { ...subAccount, estimated: fringeValue(subAccount.estimated, fringes) };
  } else {
    return subAccount;
  }
};

const recalculateSubAccountMetrics = <
  S extends Modules.Budgeting.SubAccountsStore<SA, G>,
  SA extends Model.BudgetSubAccount | Model.TemplateSubAccount,
  G extends Model.Group
>(
  /* eslint-disable indent */
  action: Redux.Action<any>,
  st: S,
  sub: number | SA
): S => {
  let subAccount: SA;
  if (typeof sub === "number") {
    const foundSubAccount: SA | null = find(st.data, { id: sub } as any) || null;
    if (isNil(foundSubAccount)) {
      warnInconsistentState({
        action: action.type,
        reason: "Sub-account does not exist in state when it is expected to.",
        id: sub
      });
      return st;
    }
    subAccount = foundSubAccount;
  } else {
    subAccount = sub;
  }
  // In the case that the SubAccount has sub accounts itself, the estimated value is determined
  // from the accumulation of those individual estimated values.  In this case,  we do not need
  // to update the SubAccount estimated value in state because it only changes when the estimated
  // values of it's SubAccount(s) on another page are altered.
  if (subAccount.subaccounts.length === 0 && !isNil(subAccount.quantity) && !isNil(subAccount.rate)) {
    const multiplier = subAccount.multiplier || 1.0;
    let payload: any = {
      estimated: multiplier * subAccount.quantity * subAccount.rate
    };
    if (typeguards.isBudgetSubAccount(subAccount)) {
      if (!isNil(subAccount.actual) && !isNil(payload.estimated)) {
        payload = { ...payload, variance: payload.estimated - subAccount.actual };
      }
    }
    subAccount = { ...subAccount, ...payload };
    subAccount = recalculateSubAccountFromFringes<S, SA, G>(action, st, subAccount);
    return {
      ...st,
      data: replaceInArray<SA>(st.data, { id: subAccount.id }, subAccount)
    };
  } else {
    return st;
  }
};

export const createSubAccountsReducer = <
  S extends Modules.Budgeting.SubAccountsStore<SA, G>,
  R extends Table.Row,
  SA extends Model.BudgetSubAccount | Model.TemplateSubAccount,
  G extends Model.Group
>(
  directive: Modules.Budgeting.BudgetDirective,
  mapping: SubAccountsReducerFactoryActionMap,
  manager: models.RowManager<R, SA, Http.SubAccountPayload>,
  initialState: S
): Reducer<S, Redux.Action<any>> => {
  let historySubReducers = {};
  if (!isNil(mapping.History)) {
    historySubReducers = {
      history: createModelListResponseReducer<Model.HistoryEvent>({
        Response: mapping.History.Response,
        Request: mapping.History.Request,
        Loading: mapping.History.Loading
      })
    };
  }
  const listResponseReducer = createModelListResponseReducer<SA, S>(
    {
      Response: mapping.Response,
      Request: mapping.Request,
      Loading: mapping.Loading,
      SetSearch: mapping.SetSearch,
      RemoveFromState: mapping.RemoveFromState,
      AddToState: mapping.AddToState,
      Select: mapping.Select,
      Deselect: mapping.Deselect,
      SelectAll: mapping.SelectAll,
      Deleting: mapping.Deleting,
      Updating: mapping.Updating,
      Creating: mapping.Creating
    },
    {
      strictSelect: false,
      subReducers: {
        fringes: createFringesReducer(directive),
        groups: createModelListResponseReducer<G, Redux.ModelListResponseStore<G>>({
          Response: mapping.Groups.Response,
          Request: mapping.Groups.Request,
          Loading: mapping.Groups.Loading,
          RemoveFromState: mapping.Groups.RemoveFromState,
          AddToState: mapping.Groups.AddToState,
          UpdateInState: mapping.Groups.UpdateInState,
          Deleting: mapping.Groups.Deleting
        }),
        ...historySubReducers
      }
    }
  );
  return (state: S = initialState, action: Redux.Action<any>): S => {
    let newState = { ...state };

    newState = listResponseReducer(newState, action);

    if (action.type === mapping.Groups.UpdateInState) {
      const group: G = action.payload;
      newState = recalculateGroupMetrics<S, SA, G>(action, newState, group.id);
    } else if (action.type === mapping.Groups.AddToState) {
      const group: G = action.payload;
      forEach(group.children, (id: number) => {
        const subAccount: SA | undefined = find(newState.data, { id } as any);
        if (isNil(subAccount)) {
          warnInconsistentState({
            action: action.type,
            reason: "Sub-account does not exist in state for group child.",
            id,
            groupId: group.id
          });
        } else {
          newState = {
            ...newState,
            data: replaceInArray<SA>(newState.data, { id }, { ...subAccount, group: group.id })
          };
        }
      });
    } else if (action.type === mapping.Groups.RemoveFromState) {
      // NOTE: Here, we cannot look at the group that was removed from state because the action
      // only includes the group ID and the group was already removed from state.  Instead, we will
      // clear the group for any SubAccount that belongs to a group no longer in state.
      forEach(newState.data, (subAccount: SA) => {
        if (!isNil(subAccount.group)) {
          const group: G | undefined = find(newState.groups.data, {
            id: subAccount.group
          } as any);
          if (isNil(group)) {
            newState = {
              ...newState,
              data: replaceInArray<SA>(newState.data, { id: subAccount.id }, { ...subAccount, group: null })
            };
          }
        }
      });
    } else if (action.type === mapping.TableChanged) {
      const consolidated = consolidateTableChange(action.payload);
      for (let i = 0; i < consolidated.length; i++) {
        let subAccount: SA | null = find(newState.data, { id: consolidated[i].id } as any) || null;
        if (isNil(subAccount)) {
          warnInconsistentState({
            action: action.type,
            reason: "Sub-account does not exist in state when it is expected to.",
            id: consolidated[i].id
          });
        } else {
          subAccount = manager.mergeChangesWithModel(subAccount, consolidated[i]);
          newState = recalculateSubAccountMetrics<S, SA, G>(action, newState, subAccount);
          if (!isNil(subAccount.group)) {
            newState = recalculateGroupMetrics<S, SA, G>(action, newState, subAccount.group);
          }
        }
      }
    } else if (action.type === mapping.Fringes.UpdateInState) {
      // Since the Fringes are displayed in a modal and not on a separate page, when a Fringe is
      // changed we need to recalculate the SubAcccount(s) that have that Fringe so they display
      // estimated values that are consistent with the change to the Fringe.
      const fringe: Model.Fringe | undefined = find(newState.fringes.data, { id: action.payload.id });
      if (isNil(fringe)) {
        warnInconsistentState({
          action: action.type,
          reason: "Fringe does not exist in state when it is expected to.",
          id: action.payload
        });
      } else {
        const subAccountsWithFringe = filter(newState.data, (subaccount: SA) =>
          includes(subaccount.fringes, fringe.id)
        );
        for (let i = 0; i < subAccountsWithFringe.length; i++) {
          // NOTE: We have to recalculate the SubAccount metrics, instead of just refringing
          // the value, because the current estimated value on the SubAccount already has fringes
          // applied, and there is no way to refringe an already fringed value if we do not know
          // what the previous fringes were.
          newState = recalculateSubAccountMetrics<S, SA, G>(action, newState, subAccountsWithFringe[i]);
        }
      }
    } else if (action.type === mapping.RemoveFromGroup || action.type === mapping.RemoveFromState) {
      const group: G | undefined = find(newState.groups.data, (g: G) => includes(g.children, action.payload));
      if (isNil(group)) {
        warnInconsistentState({
          action: action.type,
          reason: "Group does not exist for sub-account.",
          id: action.payload
        });
      } else {
        newState = {
          ...newState,
          groups: {
            ...newState.groups,
            data: replaceInArray<G>(
              newState.groups.data,
              { id: group.id },
              {
                ...group,
                children: filter(group.children, (child: number) => child !== action.payload)
              }
            )
          }
        };
        newState = recalculateGroupMetrics<S, SA, G>(action, newState, group.id);
      }
    } else if (action.type === mapping.AddToGroup) {
      const group: G | undefined = find(newState.groups.data, { id: action.payload.group });
      if (isNil(group)) {
        warnInconsistentState({
          action: action.type,
          reason: "Group does not exist for sub-account.",
          id: action.payload
        });
      } else {
        newState = {
          ...newState,
          groups: {
            ...newState.groups,
            data: replaceInArray<G>(
              newState.groups.data,
              { id: group.id },
              {
                ...group,
                children: [...group.children, action.payload.id]
              }
            )
          }
        };
        newState = recalculateGroupMetrics<S, SA, G>(action, newState, group.id);
      }
    }
    return newState;
  };
};

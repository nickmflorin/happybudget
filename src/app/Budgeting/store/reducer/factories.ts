import { Reducer } from "redux";
import { isNil, find, includes, map, filter, reduce, forEach } from "lodash";
import { createModelListResponseReducer } from "lib/redux/factories";
import { warnInconsistentState } from "lib/redux/util";
import * as typeguards from "lib/model/typeguards";
import { fringeValue } from "lib/model/util";
import { replaceInArray } from "lib/util";

import { initialBudgetSubAccountsState, initialTemplateSubAccountsState } from "../initialState";
import createFringesReducer from "./fringes";

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
  Response: string;
  Request: string;
  Loading: string;
  SetSearch: string;
  UpdateInState: string;
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
}

export interface TemplateSubAccountsReducerFactoryActionMap extends SubAccountsReducerFactoryActionMap {}

export interface BudgetSubAccountsReducerFactoryActionMap extends SubAccountsReducerFactoryActionMap {
  History: SubAccountsHistoryActionMap;
}

const recalculateGroupMetrics = <
  G extends Model.BudgetGroup | Model.TemplateGroup,
  SA extends Model.BudgetSubAccount | Model.TemplateSubAccount = G extends Model.BudgetGroup
    ? Model.BudgetSubAccount
    : Model.TemplateSubAccount,
  S extends Modules.Budgeting.SubAccountsStore<any, any> = G extends Model.BudgetGroup
    ? Modules.Budgeting.Budget.SubAccountsStore
    : Modules.Budgeting.Template.SubAccountsStore
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
  const group = find(st.groups.data, { id: groupId });
  if (isNil(group)) {
    warnInconsistentState({
      action: action.type,
      reason: "Group does not exist in state when it is expected to.",
      id: groupId
    });
    return st;
  }
  const subAccounts = filter(
    map(group.children, (id: number) => {
      const subAccount = find(st.data, { id });
      if (!isNil(subAccount)) {
        return subAccount;
      } else {
        warnInconsistentState({
          action: action.type,
          reason: "Group child sub-account does not exist in state when it is expected to.",
          id: id,
          groupId: group.id
        });
        return null;
      }
    }),
    (child: SA | null) => child !== null
  ) as SA[];
  let payload: any = {
    estimated: reduce(subAccounts, (sum: number, s: SA) => sum + (s.estimated || 0), 0)
  };
  if (typeguards.isBudgetGroup(group)) {
    const budgetSubAccounts = subAccounts as Model.BudgetSubAccount[];
    const actual = reduce(budgetSubAccounts, (sum: number, s: Model.BudgetSubAccount) => sum + (s.actual || 0), 0);
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

const recalculateSubAccountFromFringes = <
  D extends Modules.Budgeting.BudgetDirective,
  SA extends Model.BudgetSubAccount | Model.TemplateSubAccount = D extends "Budget"
    ? Model.BudgetSubAccount
    : Model.TemplateSubAccount,
  S extends Modules.Budgeting.SubAccountsStore<any, any> = D extends "Budget"
    ? Modules.Budgeting.Budget.SubAccountsStore
    : Modules.Budgeting.Template.SubAccountsStore
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
  D extends Modules.Budgeting.BudgetDirective,
  SA extends Model.BudgetSubAccount | Model.TemplateSubAccount = D extends "Budget"
    ? Model.BudgetSubAccount
    : Model.TemplateSubAccount,
  S extends Modules.Budgeting.SubAccountsStore<any, any> = D extends "Budget"
    ? Modules.Budgeting.Budget.SubAccountsStore
    : Modules.Budgeting.Template.SubAccountsStore
>(
  /* eslint-disable indent */
  action: Redux.Action<any>,
  st: S,
  sub: number | SA
): S => {
  let subAccount: SA;
  if (typeof sub === "number") {
    const foundSubAccount: SA | null = find(st.data, { id: sub }) || null;
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
    subAccount = recalculateSubAccountFromFringes<D, SA, S>(action, st, subAccount);

    return {
      ...st,
      data: replaceInArray<SA>(st.data, { id: subAccount.id }, subAccount)
    };
  } else {
    return st;
  }
};

// TODO: These two factories (for the budget case and the template case) are nearly identicaly,
// and should be refactored if possible.
export const createTemplateSubAccountsReducer = (
  mapping: TemplateSubAccountsReducerFactoryActionMap
): Reducer<Modules.Budgeting.Template.SubAccountsStore, Redux.Action<any>> => {
  const listResponseReducer = createModelListResponseReducer<
    Model.TemplateSubAccount,
    Modules.Budgeting.Template.SubAccountsStore
  >(
    {
      Response: mapping.Response,
      Request: mapping.Request,
      Loading: mapping.Loading,
      SetSearch: mapping.SetSearch,
      UpdateInState: mapping.UpdateInState,
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
        fringes: createFringesReducer("Template"),
        groups: createModelListResponseReducer<Model.BudgetGroup, Redux.ModelListResponseStore<Model.BudgetGroup>>({
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

  return (
    state: Modules.Budgeting.Template.SubAccountsStore = initialTemplateSubAccountsState,
    action: Redux.Action<any>
  ): Modules.Budgeting.Template.SubAccountsStore => {
    let newState = { ...state };

    newState = listResponseReducer(newState, action);

    if (action.type === mapping.Groups.UpdateInState) {
      const group: Model.BudgetGroup = action.payload;
      newState = recalculateGroupMetrics<Model.TemplateGroup>(action, newState, group.id);
    } else if (action.type === mapping.Groups.AddToState) {
      const group: Model.BudgetGroup = action.payload;
      forEach(group.children, (simpleSubAccount: number) => {
        const subAccount = find(newState.data, { id: simpleSubAccount });
        if (isNil(subAccount)) {
          warnInconsistentState({
            action: action.type,
            reason: "Sub-account does not exist in state for group child.",
            id: simpleSubAccount,
            groupId: group.id
          });
        } else {
          newState = {
            ...newState,
            data: replaceInArray<Model.TemplateSubAccount>(
              newState.data,
              { id: simpleSubAccount },
              { ...subAccount, group: group.id }
            )
          };
        }
      });
    } else if (action.type === mapping.Groups.RemoveFromState) {
      // NOTE: Here, we cannot look at the group that was removed from state because the action
      // only includes the group ID and the group was already removed from state.  Instead, we will
      // clear the group for any SubAccount that belongs to a group no longer in state.
      forEach(newState.data, (subAccount: Model.TemplateSubAccount) => {
        if (!isNil(subAccount.group)) {
          const group: Model.TemplateGroup | undefined = find(newState.groups.data, {
            id: subAccount.group
          });
          if (isNil(group)) {
            newState = {
              ...newState,
              data: replaceInArray<Model.TemplateSubAccount>(
                newState.data,
                { id: subAccount.id },
                { ...subAccount, group: null }
              )
            };
          }
        }
      });
    } else if (action.type === mapping.UpdateInState) {
      const subAccount: Model.TemplateSubAccount = action.payload;
      newState = recalculateSubAccountMetrics<"Template">(action, newState, subAccount.id);
      if (!isNil(subAccount.group)) {
        newState = recalculateGroupMetrics<Model.TemplateGroup>(action, newState, subAccount.group);
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
        const subAccountsWithFringe = filter(newState.data, (subaccount: Model.TemplateSubAccount) =>
          includes(subaccount.fringes, fringe.id)
        );
        for (let i = 0; i < subAccountsWithFringe.length; i++) {
          // NOTE: We have to recalculate the SubAccount metrics, instead of just refringing
          // the value, because the current estimated value on the SubAccount already has fringes
          // applied, and there is no way to refringe an already fringed value if we do not know
          // what the previous fringes were.
          newState = recalculateSubAccountMetrics<"Template">(action, newState, subAccountsWithFringe[i]);
        }
      }
    } else if (action.type === mapping.RemoveFromGroup || action.type === mapping.RemoveFromState) {
      const group: Model.TemplateGroup | undefined = find(newState.groups.data, (g: Model.TemplateGroup) =>
        includes(
          map(g.children, (child: Model.SimpleSubAccount) => child.id),
          action.payload
        )
      );
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
            data: replaceInArray<Model.TemplateGroup>(
              newState.groups.data,
              { id: group.id },
              {
                ...group,
                children: filter(group.children, (child: number) => child !== action.payload)
              }
            )
          }
        };
        newState = recalculateGroupMetrics<Model.TemplateGroup>(action, newState, group.id);
      }
    } else if (action.type === mapping.AddToGroup) {
      const group: Model.TemplateGroup | undefined = find(newState.groups.data, { id: action.payload.group });
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
            data: replaceInArray<Model.TemplateGroup>(
              newState.groups.data,
              { id: group.id },
              {
                ...group,
                children: [...group.children, action.payload.id]
              }
            )
          }
        };
        newState = recalculateGroupMetrics<Model.TemplateGroup>(action, newState, group.id);
      }
    }
    return newState;
  };
};

export const createBudgetSubAccountsReducer = (
  mapping: BudgetSubAccountsReducerFactoryActionMap
): Reducer<Modules.Budgeting.Budget.SubAccountsStore, Redux.Action<any>> => {
  const listResponseReducer = createModelListResponseReducer<
    Model.BudgetSubAccount,
    Modules.Budgeting.Budget.SubAccountsStore
  >(
    {
      Response: mapping.Response,
      Request: mapping.Request,
      Loading: mapping.Loading,
      SetSearch: mapping.SetSearch,
      UpdateInState: mapping.UpdateInState,
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
        fringes: createFringesReducer("Budget"),
        groups: createModelListResponseReducer<Model.BudgetGroup, Redux.ModelListResponseStore<Model.BudgetGroup>>({
          Response: mapping.Groups.Response,
          Request: mapping.Groups.Request,
          Loading: mapping.Groups.Loading,
          RemoveFromState: mapping.Groups.RemoveFromState,
          AddToState: mapping.Groups.AddToState,
          UpdateInState: mapping.Groups.UpdateInState,
          Deleting: mapping.Groups.Deleting
        }),
        history: createModelListResponseReducer<Model.HistoryEvent>({
          Response: mapping.History.Response,
          Request: mapping.History.Request,
          Loading: mapping.History.Loading
        })
      }
    }
  );

  return (
    state: Modules.Budgeting.Budget.SubAccountsStore = initialBudgetSubAccountsState,
    action: Redux.Action<any>
  ): Modules.Budgeting.Budget.SubAccountsStore => {
    let newState = { ...state };

    newState = listResponseReducer(newState, action);

    if (action.type === mapping.Groups.UpdateInState) {
      const group: Model.BudgetGroup = action.payload;
      newState = recalculateGroupMetrics<Model.BudgetGroup>(action, newState, group.id);
    } else if (action.type === mapping.Groups.AddToState) {
      const group: Model.BudgetGroup = action.payload;
      forEach(group.children, (simpleSubAccount: number) => {
        const subAccount = find(newState.data, { id: simpleSubAccount });
        if (isNil(subAccount)) {
          warnInconsistentState({
            action: action.type,
            reason: "Sub-account does not exist in state for group child.",
            id: simpleSubAccount,
            groupId: group.id
          });
        } else {
          newState = {
            ...newState,
            data: replaceInArray<Model.BudgetSubAccount>(
              newState.data,
              { id: simpleSubAccount },
              { ...subAccount, group: group.id }
            )
          };
        }
      });
    } else if (action.type === mapping.Groups.RemoveFromState) {
      // NOTE: Here, we cannot look at the group that was removed from state because the action
      // only includes the group ID and the group was already removed from state.  Instead, we will
      // clear the group for any SubAccount that belongs to a group no longer in state.
      forEach(newState.data, (subAccount: Model.BudgetSubAccount) => {
        if (!isNil(subAccount.group)) {
          const group: Model.BudgetGroup | undefined = find(newState.groups.data, {
            id: subAccount.group
          });
          if (isNil(group)) {
            newState = {
              ...newState,
              data: replaceInArray<Model.BudgetSubAccount>(
                newState.data,
                { id: subAccount.id },
                { ...subAccount, group: null }
              )
            };
          }
        }
      });
    } else if (action.type === mapping.UpdateInState) {
      const subAccount: Model.BudgetSubAccount = action.payload;
      newState = recalculateSubAccountMetrics<"Budget">(action, newState, subAccount.id);
      if (!isNil(subAccount.group)) {
        newState = recalculateGroupMetrics<Model.BudgetGroup>(action, newState, subAccount.group);
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
        const subAccountsWithFringe = filter(newState.data, (subaccount: Model.BudgetSubAccount) =>
          includes(subaccount.fringes, fringe.id)
        );
        for (let i = 0; i < subAccountsWithFringe.length; i++) {
          // NOTE: We have to recalculate the SubAccount metrics, instead of just refringing
          // the value, because the current estimated value on the SubAccount already has fringes
          // applied, and there is no way to refringe an already fringed value if we do not know
          // what the previous fringes were.
          newState = recalculateSubAccountMetrics<"Budget">(action, newState, subAccountsWithFringe[i]);
        }
      }
    } else if (action.type === mapping.RemoveFromGroup || action.type === mapping.RemoveFromState) {
      const group: Model.BudgetGroup | undefined = find(newState.groups.data, (g: Model.BudgetGroup) =>
        includes(g.children, action.payload)
      );
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
            data: replaceInArray<Model.BudgetGroup>(
              newState.groups.data,
              { id: group.id },
              {
                ...group,
                children: filter(group.children, (child: number) => child !== action.payload)
              }
            )
          }
        };
        newState = recalculateGroupMetrics<Model.BudgetGroup>(action, newState, group.id);
      }
    } else if (action.type === mapping.AddToGroup) {
      const group: Model.BudgetGroup | undefined = find(newState.groups.data, { id: action.payload.group });
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
            data: replaceInArray<Model.BudgetGroup>(
              newState.groups.data,
              { id: group.id },
              {
                ...group,
                children: [...group.children, action.payload.id]
              }
            )
          }
        };
        newState = recalculateGroupMetrics<Model.BudgetGroup>(action, newState, group.id);
      }
    }
    return newState;
  };
};

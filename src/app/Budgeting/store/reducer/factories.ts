import { Reducer } from "redux";
import { isNil, find, includes, map, filter, reduce, forEach } from "lodash";
import { createModelListResponseReducer } from "lib/redux/factories";
import { warnInconsistentState } from "lib/redux/util";
import { fringeValue } from "lib/model/util";
import { replaceInArray } from "lib/util";

import { initialBudgetSubAccountsState, initialTemplateSubAccountsState } from "../initialState";
import fringesRootReducer from "./fringes";

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

export interface TemplateSubAccountsReducerFactoryActionMap {
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
}

export interface BudgetSubAccountsReducerFactoryActionMap {
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
  History: SubAccountsHistoryActionMap;
}

// TODO: These two factories (for the budget case and the template case) are nearly identicaly,
// and should be refactored if possible.
export const createTemplateSubAccountsReducer = (
  mapping: TemplateSubAccountsReducerFactoryActionMap
): Reducer<Redux.Budgeting.Template.SubAccountsStore, Redux.Action<any>> => {
  const listResponseReducer = createModelListResponseReducer<
    Model.TemplateSubAccount,
    Redux.Budgeting.Template.SubAccountsStore
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
        fringes: fringesRootReducer,
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

  const recalculateGroupMetrics = (
    st: Redux.Budgeting.Template.SubAccountsStore,
    groupId: number
  ): Redux.Budgeting.Template.SubAccountsStore => {
    // This might not be totally necessary, but it is good practice to not use the entire payload
    // to update the group (since that is already done by the reducer above) but to instead just
    // update the parts of the relevant parts of the current group in state (estimated, variance,
    // actual).
    const group = find(st.groups.data, { id: groupId });
    if (isNil(group)) {
      throw new Error(`The group with ID ${groupId} no longer exists in state!`);
    }
    const subAccounts = filter(
      map(group.children, (id: number) => {
        const subAccount = find(st.data, { id });
        if (!isNil(subAccount)) {
          return subAccount;
        } else {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State: Inconsistent state noticed when updating group in state.  Group child
            with ID ${id} does not exist in state when it is expected to.`
          );
          return null;
        }
      }),
      (child: Model.TemplateSubAccount | null) => child !== null
    ) as Model.TemplateSubAccount[];
    const estimated = reduce(subAccounts, (sum: number, s: Model.TemplateSubAccount) => sum + (s.estimated || 0), 0);
    return {
      ...st,
      groups: {
        ...st.groups,
        data: replaceInArray<Model.TemplateGroup>(st.groups.data, { id: group.id }, { ...group, ...{ estimated } })
      }
    };
  };

  const recalculateSubAccountFromFringes = (
    st: Redux.Budgeting.Template.SubAccountsStore,
    subAccount: Model.TemplateSubAccount
  ): Model.TemplateSubAccount => {
    if (!isNil(subAccount.estimated)) {
      const fringes: Model.Fringe[] = filter(
        map(subAccount.fringes, (id: number) => {
          const fringe: Model.Fringe | undefined = find(st.fringes.data, { id });
          if (!isNil(fringe)) {
            return fringe;
          } else {
            /* eslint-disable no-console */
            console.error(
              `Inconsistent State! Inconsistent state noticed when updating sub-account in state...
            The fringe ${id} for sub-account ${subAccount.id} does not exist in state when it
            is expected to.`
            );
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

  const recalculateSubAccountMetrics = (
    st: Redux.Budgeting.Template.SubAccountsStore,
    id: number
  ): Redux.Budgeting.Template.SubAccountsStore => {
    let subAccount = find(st.data, { id });
    if (isNil(subAccount)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State: Inconsistent state noticed when updating sub account in state. The
          sub account with ID ${id} does not exist in state when it is expected to.`
      );
      return st;
    } else {
      // In the case that the SubAccount has sub accounts itself, the estimated value is determined
      // from the accumulation of those individual estimated values.  In this case,  we do not need
      // to update the SubAccount estimated value in state because it only changes when the estimated
      // values of it's SubAccount(s) on another page are altered.
      if (subAccount.subaccounts.length === 0 && !isNil(subAccount.quantity) && !isNil(subAccount.rate)) {
        const multiplier = subAccount.multiplier || 1.0;
        let payload: Partial<Model.TemplateSubAccount> = {
          estimated: multiplier * subAccount.quantity * subAccount.rate
        };
        subAccount = { ...subAccount, ...payload };
        subAccount = recalculateSubAccountFromFringes(st, subAccount);

        return {
          ...st,
          data: replaceInArray<Model.TemplateSubAccount>(st.data, { id: subAccount.id }, subAccount)
        };
      } else {
        return st;
      }
    }
  };

  return (
    state: Redux.Budgeting.Template.SubAccountsStore = initialTemplateSubAccountsState,
    action: Redux.Action<any>
  ): Redux.Budgeting.Template.SubAccountsStore => {
    let newState = { ...state };

    newState = listResponseReducer(newState, action);

    if (action.type === mapping.Groups.UpdateInState) {
      const group: Model.BudgetGroup = action.payload;
      newState = recalculateGroupMetrics(newState, group.id);
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
      newState = recalculateSubAccountMetrics(newState, subAccount.id);
      if (!isNil(subAccount.group)) {
        newState = recalculateGroupMetrics(newState, subAccount.group);
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
        newState = recalculateGroupMetrics(newState, group.id);
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
        newState = recalculateGroupMetrics(newState, group.id);
      }
    }
    return newState;
  };
};

export const createBudgetSubAccountsReducer = (
  mapping: BudgetSubAccountsReducerFactoryActionMap
): Reducer<Redux.Budgeting.Budget.SubAccountsStore, Redux.Action<any>> => {
  const listResponseReducer = createModelListResponseReducer<
    Model.BudgetSubAccount,
    Redux.Budgeting.Budget.SubAccountsStore
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
        fringes: fringesRootReducer,
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

  const recalculateGroupMetrics = (
    st: Redux.Budgeting.Budget.SubAccountsStore,
    groupId: number
  ): Redux.Budgeting.Budget.SubAccountsStore => {
    // This might not be totally necessary, but it is good practice to not use the entire payload
    // to update the group (since that is already done by the reducer above) but to instead just
    // update the parts of the relevant parts of the current group in state (estimated, variance,
    // actual).
    const group = find(st.groups.data, { id: groupId });
    if (isNil(group)) {
      throw new Error(`The group with ID ${groupId} no longer exists in state!`);
    }
    const subAccounts = filter(
      map(group.children, (id: number) => {
        const subAccount = find(st.data, { id });
        if (!isNil(subAccount)) {
          return subAccount;
        } else {
          /* eslint-disable no-console */
          console.error(
            `Inconsistent State: Inconsistent state noticed when updating group in state.  Group child
        with ID ${id} does not exist in state when it is expected to.`
          );
          return null;
        }
      }),
      (child: Model.BudgetSubAccount | null) => child !== null
    ) as Model.BudgetSubAccount[];
    const actual = reduce(subAccounts, (sum: number, s: Model.BudgetSubAccount) => sum + (s.actual || 0), 0);
    const estimated = reduce(subAccounts, (sum: number, s: Model.BudgetSubAccount) => sum + (s.estimated || 0), 0);
    return {
      ...st,
      groups: {
        ...st.groups,
        data: replaceInArray<Model.BudgetGroup>(
          st.groups.data,
          { id: group.id },
          { ...group, ...{ estimated, actual, variance: estimated - actual } }
        )
      }
    };
  };

  const recalculateSubAccountFromFringes = (
    st: Redux.Budgeting.Budget.SubAccountsStore,
    subAccount: Model.BudgetSubAccount
  ): Model.BudgetSubAccount => {
    if (!isNil(subAccount.estimated)) {
      const fringes: Model.Fringe[] = filter(
        map(subAccount.fringes, (id: number) => {
          const fringe: Model.Fringe | undefined = find(st.fringes.data, { id });
          if (!isNil(fringe)) {
            return fringe;
          } else {
            /* eslint-disable no-console */
            console.error(
              `Inconsistent State! Inconsistent state noticed when updating sub-account in state...
            The fringe ${id} for sub-account ${subAccount.id} does not exist in state when it
            is expected to.`
            );
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

  const recalculateSubAccountMetrics = (
    st: Redux.Budgeting.Budget.SubAccountsStore,
    id: number
  ): Redux.Budgeting.Budget.SubAccountsStore => {
    let subAccount = find(st.data, { id });
    if (isNil(subAccount)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State: Inconsistent state noticed when updating sub account in state. The
          sub account with ID ${id} does not exist in state when it is expected to.`
      );
      return st;
    } else {
      // In the case that the SubAccount has sub accounts itself, the estimated value is determined
      // from the accumulation of those individual estimated values.  In this case,  we do not need
      // to update the SubAccount estimated value in state because it only changes when the estimated
      // values of it's SubAccount(s) on another page are altered.
      if (subAccount.subaccounts.length === 0 && !isNil(subAccount.quantity) && !isNil(subAccount.rate)) {
        const multiplier = subAccount.multiplier || 1.0;
        let payload: Partial<Model.BudgetSubAccount> = {
          estimated: multiplier * subAccount.quantity * subAccount.rate
        };
        if (!isNil(subAccount.actual) && !isNil(payload.estimated)) {
          payload = { ...payload, variance: payload.estimated - subAccount.actual };
        }
        subAccount = { ...subAccount, ...payload };
        subAccount = recalculateSubAccountFromFringes(st, subAccount);

        return {
          ...st,
          data: replaceInArray<Model.BudgetSubAccount>(st.data, { id: subAccount.id }, subAccount)
        };
      } else {
        return st;
      }
    }
  };

  return (
    state: Redux.Budgeting.Budget.SubAccountsStore = initialBudgetSubAccountsState,
    action: Redux.Action<any>
  ): Redux.Budgeting.Budget.SubAccountsStore => {
    let newState = { ...state };

    newState = listResponseReducer(newState, action);

    if (action.type === mapping.Groups.UpdateInState) {
      const group: Model.BudgetGroup = action.payload;
      newState = recalculateGroupMetrics(newState, group.id);
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
      newState = recalculateSubAccountMetrics(newState, subAccount.id);
      if (!isNil(subAccount.group)) {
        newState = recalculateGroupMetrics(newState, subAccount.group);
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
        newState = recalculateGroupMetrics(newState, group.id);
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
        newState = recalculateGroupMetrics(newState, group.id);
      }
    }
    return newState;
  };
};

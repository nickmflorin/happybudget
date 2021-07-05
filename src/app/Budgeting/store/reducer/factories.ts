import { Reducer } from "redux";
import { isNil, find, includes, map, filter, reduce, forEach, uniq } from "lodash";

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
      // This will eventually be removed when we let the reducer respond to
      // the RowAddEvent directly.
      AddToState: ActionType[directive].Fringes.AddToState,
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
    let newState = listResponseReducer(state, action);
    if (action.type === ActionType[directive].Fringes.TableChanged) {
      const event: Table.ChangeEvent<BudgetTable.FringeRow> = action.payload;

      if (typeguards.isDataChangeEvent(event)) {
        const consolidated = consolidateTableChange(event.payload);

        // The consolidated changes should contain one change per sub account, but
        // just in case we apply that grouping logic here.
        let changesPerFringe: {
          [key: number]: { changes: Table.RowChange<BudgetTable.FringeRow>[]; model: Model.Fringe };
        } = {};
        for (let i = 0; i < consolidated.length; i++) {
          if (isNil(changesPerFringe[consolidated[i].id])) {
            const fringe: Model.Fringe | undefined = find(newState.data, { id: consolidated[i].id } as any);
            if (isNil(fringe)) {
              warnInconsistentState({
                action: action.type,
                reason: "Fringe does not exist in state when it is expected to.",
                id: consolidated[i].id
              });
            } else {
              changesPerFringe[consolidated[i].id] = { changes: [], model: fringe };
            }
          }
          if (!isNil(changesPerFringe[consolidated[i].id])) {
            changesPerFringe[consolidated[i].id] = {
              ...changesPerFringe[consolidated[i].id],
              changes: [...changesPerFringe[consolidated[i].id].changes, consolidated[i]]
            };
          }
        }
        // For each of the SubAccount(s) that were changed, apply those changes to the current
        // SubAccount model in state.
        for (let k = 0; k < Object.keys(changesPerFringe).length; k++) {
          const id = parseInt(Object.keys(changesPerFringe)[k]);
          const changesObj = changesPerFringe[id];
          let fringe = changesObj.model;
          for (let j = 0; j < changesObj.changes.length; j++) {
            fringe = models.FringeRowManager.mergeChangesWithModel(changesObj.model, changesObj.changes[j]);
          }
          newState = {
            ...newState,
            data: replaceInArray<Model.Fringe>(newState.data, { id: fringe.id }, fringe)
          };
        }
      } else if (typeguards.isRowAddEvent(event)) {
        // Eventually, we will want to implement this - so we do not have to rely on waiting
        // for the response of the API request.
      } else if (typeguards.isRowDeleteEvent(event)) {
        const ids = Array.isArray(event.payload) ? event.payload : [event.payload];
        for (let i = 0; i < ids.length; i++) {
          newState = {
            ...newState,
            /* eslint-disable no-loop-func */
            data: filter(newState.data, (m: Model.Fringe) => m.id !== ids[i]),
            count: newState.count - 1
          };
        }
      }
    }
    return newState;
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
  // This will eventually be removed when we let the reducer respond to
  // the RowAddEvent directly.
  AddToState: string;
  RemoveFromGroup: string;
  AddToGroup: string;
  Creating: string;
  Updating: string;
  Deleting: string;
  Groups: AccountsGroupsActionMap;
  History?: AccountsHistoryActionMap;
}

const groupFromState = <
  S extends Modules.Budgeting.AccountsStore<M, G> | Modules.Budgeting.SubAccountsStore<M, G>,
  M extends Model.BudgetAccount | Model.TemplateAccount | Model.BudgetSubAccount | Model.TemplateSubAccount,
  G extends Model.Group
>(
  action: Redux.Action<any>,
  st: S,
  id: G | number,
  subaccountId?: number
): G | null => {
  if (typeof id === "number") {
    let predicate = (g: G) => g.id === id;
    if (!isNil(subaccountId)) {
      predicate = (g: G) => g.id === id && includes(g.children, subaccountId);
    }
    let groupObj: G | undefined = find(st.groups.data, predicate);
    if (isNil(groupObj)) {
      warnInconsistentState({
        action: action.type,
        reason: "Group does not exist in state when it is expected to.",
        id: id
      });
      return null;
    }
    return groupObj;
  }
  return id;
};

const recalculateGroupMetrics = <
  S extends Modules.Budgeting.AccountsStore<M, G> | Modules.Budgeting.SubAccountsStore<M, G>,
  M extends Model.BudgetAccount | Model.TemplateAccount | Model.BudgetSubAccount | Model.TemplateSubAccount,
  G extends Model.Group
>(
  /* eslint-disable indent */
  action: Redux.Action<any>,
  st: S,
  group: G | number
): S => {
  const stateGroup = groupFromState(action, st, group);
  if (!isNil(stateGroup)) {
    const objs = filter(
      map(stateGroup.children, (id: number) => {
        const obj = find(st.data, { id });
        if (!isNil(obj)) {
          return obj;
        } else {
          warnInconsistentState({
            action: action.type,
            reason: "Group child account/sub-account does not exist in state when it is expected to.",
            id: id,
            groupId: stateGroup.id
          });
          return null;
        }
      }),
      (child: M | null) => child !== null
    ) as M[];
    let payload: any = {
      estimated: reduce(objs, (sum: number, s: M) => sum + (s.estimated || 0), 0)
    };
    if (typeguards.isBudgetGroup(stateGroup)) {
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
        data: replaceInArray<G>(st.groups.data, { id: stateGroup.id }, { ...stateGroup, ...payload })
      }
    };
  }
  return st;
};

const modelFromState = <
  S extends Modules.Budgeting.AccountsStore<M, G> | Modules.Budgeting.SubAccountsStore<M, G>,
  M extends Model.BudgetAccount | Model.TemplateAccount | Model.BudgetSubAccount | Model.TemplateSubAccount,
  G extends Model.Group
>(
  action: Redux.Action<any>,
  st: S,
  id: M | number
): M | null => {
  if (typeof id === "number") {
    let obj: M | undefined = find(st.data, (m: M) => m.id === id);
    if (isNil(obj)) {
      warnInconsistentState({
        action: action.type,
        reason: "Model does not exist in state when it is expected to.",
        id: id
      });
      return null;
    }
    return obj;
  }
  return id;
};

const removeModelFromState = <
  S extends Modules.Budgeting.AccountsStore<M, G> | Modules.Budgeting.SubAccountsStore<M, G>,
  M extends Model.BudgetAccount | Model.TemplateAccount | Model.BudgetSubAccount | Model.TemplateSubAccount,
  G extends Model.Group
>(
  action: Redux.Action<any>,
  st: S,
  id: number
) => {
  st = removeModelFromGroup<S, M, G>(action, st, id);
  return {
    ...st,
    data: filter(st.data, (m: M) => m.id !== id),
    count: st.count - 1
  };
};

const removeModelFromGroup = <
  S extends Modules.Budgeting.AccountsStore<M, G> | Modules.Budgeting.SubAccountsStore<M, G>,
  M extends Model.BudgetAccount | Model.TemplateAccount | Model.BudgetSubAccount | Model.TemplateSubAccount,
  G extends Model.Group
>(
  action: Redux.Action<any>,
  st: S,
  obj: number | M,
  group?: number | G
): S => {
  const stateModel = modelFromState<S, M, G>(action, st, obj);
  if (!isNil(stateModel) && !isNil(stateModel.group)) {
    let stateGroup: G | null;
    if (!isNil(group)) {
      stateGroup = groupFromState<S, M, G>(action, st, group, stateModel.id);
    } else {
      stateGroup = groupFromState<S, M, G>(action, st, stateModel.group, stateModel.id);
    }
    if (!isNil(stateGroup)) {
      st = {
        ...st,
        data: replaceInArray<M>(st.data, { id: stateModel.id }, { ...stateModel, group: null }),
        groups: {
          ...st.groups,
          data: replaceInArray<G>(
            st.groups.data,
            { id: stateGroup.id },
            {
              ...stateGroup,
              children: filter(stateGroup.children, (child: number) => child !== stateModel.id)
            }
          )
        }
      };
      return recalculateGroupMetrics<S, M, G>(action, st, stateGroup);
    }
  }
  return st;
};

const addModelToGroup = <
  S extends Modules.Budgeting.AccountsStore<M, G> | Modules.Budgeting.SubAccountsStore<M, G>,
  M extends Model.BudgetAccount | Model.TemplateAccount | Model.BudgetSubAccount | Model.TemplateSubAccount,
  G extends Model.Group
>(
  action: Redux.Action<any>,
  st: S,
  model: number | M,
  group: number | G
): S => {
  const stateObj = modelFromState<S, M, G>(action, st, model);
  if (!isNil(stateObj) && !isNil(stateObj.group)) {
    let stateGroup: G | null = groupFromState<S, M, G>(action, st, group, stateObj.id);
    if (!isNil(stateGroup)) {
      if (includes(stateGroup?.children, stateObj.id)) {
        warnInconsistentState({
          action,
          reason: "Model already exists as a child for group.",
          id: stateObj.id,
          group: stateGroup.id
        });
      } else {
        st = {
          ...st,
          data: replaceInArray<M>(st.data, { id: stateObj.id }, { ...stateObj, group: stateGroup.id }),
          groups: {
            ...st.groups,
            data: replaceInArray<G>(
              st.groups.data,
              { id: stateGroup.id },
              {
                ...stateGroup,
                children: [...stateGroup.children, stateObj.id]
              }
            )
          }
        };
        return recalculateGroupMetrics<S, M, G>(action, st, stateGroup.id);
      }
    }
  }
  return st;
};

const addGroupToState = <
  S extends Modules.Budgeting.AccountsStore<M, G> | Modules.Budgeting.SubAccountsStore<M, G>,
  M extends Model.BudgetAccount | Model.TemplateAccount | Model.BudgetSubAccount | Model.TemplateSubAccount,
  G extends Model.Group
>(
  action: Redux.Action<any>,
  st: S,
  group: G
): S => {
  forEach(group.children, (id: number) => {
    const model: M | null = modelFromState<S, M, G>(action, st, id);
    if (!isNil(model)) {
      st = {
        ...st,
        data: replaceInArray<M>(st.data, { id: model.id }, { ...model, group: group.id }),
        groups: {
          ...st.groups,
          data: [...st.groups.data, group],
          count: st.groups.count + 1
        }
      };
    }
  });
  return st;
};

const removeGroupFromState = <
  S extends Modules.Budgeting.AccountsStore<M, G> | Modules.Budgeting.SubAccountsStore<M, G>,
  M extends Model.BudgetAccount | Model.TemplateAccount | Model.BudgetSubAccount | Model.TemplateSubAccount,
  G extends Model.Group
>(
  action: Redux.Action<any>,
  st: S,
  id: number
): S => {
  const group: G | null = groupFromState<S, M, G>(action, st, id);
  if (!isNil(group)) {
    forEach(group.children, (child: number) => {
      st = removeModelFromGroup<S, M, G>(action, st, child, group);
    });
    st = {
      ...st,
      groups: { ...st.groups, data: filter(st.groups.data, (g: G) => g.id !== id), count: st.groups.count - 1 }
    };
  }
  return st;
};

const updateAccountInState = <
  S extends Modules.Budgeting.AccountsStore<A, G>,
  R extends Table.Row,
  A extends Model.BudgetAccount | Model.TemplateAccount,
  G extends Model.Group
>(
  action: Redux.Action<any>,
  st: S,
  manager: models.RowManager<R, A, Http.AccountPayload>,
  id: number | A,
  changes: Table.RowChange<R>[]
) => {
  let account = modelFromState<S, A, G>(action, st, id);
  if (!isNil(account)) {
    for (let j = 0; j < changes.length; j++) {
      account = manager.mergeChangesWithModel(account, changes[j]);
    }
    st = {
      ...st,
      data: replaceInArray<A>(st.data, { id: account.id }, account)
    };
    // NOTE: We do not need to update the metrics for the account because there
    // are no changes to an account that would warrant recalculations of the
    // account on the page.
    if (!isNil(account.group)) {
      st = recalculateGroupMetrics<S, A, G>(action, st, account.group);
    }
  }
  return st;
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
      // This will eventually be removed when we let the reducer respond to
      // the RowAddEvent directly.
      AddToState: mapping.AddToState,
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
          UpdateInState: mapping.Groups.UpdateInState,
          Deleting: mapping.Groups.Deleting
        })
      }
    }
  );

  return (state: S = initialState, action: Redux.Action<any>): S => {
    let newState = { ...state };

    newState = listResponseReducer(newState, action);

    if (action.type === mapping.Groups.UpdateInState) {
      const group: G = action.payload;
      newState = recalculateGroupMetrics<S, A, G>(action, newState, group.id);
    } else if (action.type === mapping.Groups.AddToState) {
      const group: G = action.payload;
      newState = addGroupToState<S, A, G>(action, newState, group);
    } else if (action.type === mapping.Groups.RemoveFromState) {
      newState = removeGroupFromState<S, A, G>(action, newState, action.payload);
    } else if (action.type === mapping.TableChanged) {
      const event: Table.ChangeEvent<R> = action.payload;

      if (typeguards.isDataChangeEvent(event)) {
        const consolidated = consolidateTableChange(event.payload);

        // The consolidated changes should contain one change per account, but
        // just in case we apply that grouping logic here.
        let changesPerAccount: { [key: number]: { changes: Table.RowChange<R>[]; model: A } } = {};
        for (let i = 0; i < consolidated.length; i++) {
          if (isNil(changesPerAccount[consolidated[i].id])) {
            const account: A | null = modelFromState<S, A, G>(action, newState, consolidated[i].id);
            if (!isNil(account)) {
              changesPerAccount[consolidated[i].id] = { changes: [], model: account };
            }
          }
          if (!isNil(changesPerAccount[consolidated[i].id])) {
            changesPerAccount[consolidated[i].id] = {
              ...changesPerAccount[consolidated[i].id],
              changes: [...changesPerAccount[consolidated[i].id].changes, consolidated[i]]
            };
          }
        }
        // For each of the Account(s) that were changed, apply those changes to the current
        // Account model in state.
        for (let k = 0; k < Object.keys(changesPerAccount).length; k++) {
          const id = parseInt(Object.keys(changesPerAccount)[k]);
          const changesObj = changesPerAccount[id];
          // Apply each relevant change before performing recalculations.
          newState = updateAccountInState<S, R, A, G>(action, newState, manager, changesObj.model, changesObj.changes);
        }
      } else if (typeguards.isRowAddEvent(event)) {
        // Eventually, we will want to implement this - so we do not have to rely on waiting
        // for the response of the API request.
      } else if (typeguards.isRowDeleteEvent(event)) {
        const ids = Array.isArray(event.payload) ? event.payload : [event.payload];
        for (let i = 0; i < ids.length; i++) {
          newState = removeModelFromState<S, A, G>(action, newState, ids[i]);
        }
      }
    } else if (action.type === mapping.RemoveFromGroup) {
      newState = removeModelFromGroup<S, A, G>(action, newState, action.payload);
    } else if (action.type === mapping.AddToGroup) {
      newState = addModelToGroup<S, A, G>(action, newState, action.payload.id, action.payload.group);
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
  TableChanged: string;
}

interface SubAccountsReducerFactoryActionMap {
  TableChanged: string;
  Response: string;
  Request: string;
  Loading: string;
  SetSearch: string;
  AddToState: string;
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

const updateSubAccountInState = <
  S extends Modules.Budgeting.SubAccountsStore<SA, G>,
  R extends Table.Row,
  SA extends Model.BudgetSubAccount | Model.TemplateSubAccount,
  G extends Model.Group
>(
  action: Redux.Action<any>,
  st: S,
  manager: models.RowManager<R, SA, Http.SubAccountPayload>,
  id: number | SA,
  changes: Table.RowChange<R>[]
) => {
  let subAccount = modelFromState<S, SA, G>(action, st, id);
  if (!isNil(subAccount)) {
    for (let j = 0; j < changes.length; j++) {
      subAccount = manager.mergeChangesWithModel(subAccount, changes[j]);
    }
    st = {
      ...st,
      data: replaceInArray<SA>(st.data, { id: subAccount.id }, subAccount)
    };
    st = recalculateSubAccountMetrics<S, SA, G>(action, st, subAccount);
    if (!isNil(subAccount.group)) {
      st = recalculateGroupMetrics<S, SA, G>(action, st, subAccount.group);
    }
  }
  return st;
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
      AddToState: mapping.AddToState,
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
      newState = addGroupToState<S, SA, G>(action, newState, group);
    } else if (action.type === mapping.Groups.RemoveFromState) {
      newState = removeGroupFromState<S, SA, G>(action, newState, action.payload);
    } else if (action.type === mapping.TableChanged) {
      const event: Table.ChangeEvent<R> = action.payload;
      if (typeguards.isDataChangeEvent(event)) {
        const consolidated = consolidateTableChange(event.payload);

        // The consolidated changes should contain one change per sub account, but
        // just in case we apply that grouping logic here.
        let changesPerSubAccount: { [key: number]: { changes: Table.RowChange<R>[]; model: SA } } = {};
        for (let i = 0; i < consolidated.length; i++) {
          if (isNil(changesPerSubAccount[consolidated[i].id])) {
            const subAccount: SA | null = modelFromState<S, SA, G>(action, newState, consolidated[i].id);
            if (!isNil(subAccount)) {
              changesPerSubAccount[consolidated[i].id] = { changes: [], model: subAccount };
            }
          }
          if (!isNil(changesPerSubAccount[consolidated[i].id])) {
            changesPerSubAccount[consolidated[i].id] = {
              ...changesPerSubAccount[consolidated[i].id],
              changes: [...changesPerSubAccount[consolidated[i].id].changes, consolidated[i]]
            };
          }
        }
        // For each of the SubAccount(s) that were changed, apply those changes to the current
        // SubAccount model in state.
        for (let k = 0; k < Object.keys(changesPerSubAccount).length; k++) {
          const id = parseInt(Object.keys(changesPerSubAccount)[k]);
          const changesObj = changesPerSubAccount[id];
          // Apply each relevant change before performing recalculations.
          newState = updateSubAccountInState<S, R, SA, G>(
            action,
            newState,
            manager,
            changesObj.model,
            changesObj.changes
          );
        }
      } else if (typeguards.isRowAddEvent(event)) {
        // Eventually, we will want to implement this - so we do not have to rely on waiting
        // for the response of the API request.
      } else if (typeguards.isRowDeleteEvent(event)) {
        const ids = Array.isArray(event.payload) ? event.payload : [event.payload];
        for (let i = 0; i < ids.length; i++) {
          newState = removeModelFromState<S, SA, G>(action, newState, ids[i]);
        }
      }
    } else if (action.type === mapping.Fringes.TableChanged) {
      // Since the Fringes are displayed in a modal and not on a separate page, when a Fringe is
      // changed we need to recalculate the SubAcccount(s) that have that Fringe so they display
      // estimated values that are consistent with the change to the Fringe.
      const event: Table.ChangeEvent<BudgetTable.FringeRow> = action.payload;

      if (typeguards.isDataChangeEvent(event)) {
        // We don't have to be concerned with the individual changes for each Fringe,
        // just the Fringe IDs of the Fringes that changed.  This is because the changes
        // will have already been applied to the individual Fringe(s).
        const consolidated = consolidateTableChange(event.payload);
        const ids = uniq(map(consolidated, (change: Table.RowChange<BudgetTable.FringeRow>) => change.id));
        map(ids, (id: number) => {
          map(
            filter(newState.data, (subaccount: SA) => includes(subaccount.fringes, id)),
            (subaccount: SA) => {
              // NOTE: We have to recalculate the SubAccount metrics, instead of just refringing
              // the value, because the current estimated value on the SubAccount already has fringes
              // applied, and there is no way to refringe an already fringed value if we do not know
              // what the previous fringes were.
              newState = recalculateSubAccountMetrics<S, SA, G>(action, newState, subaccount);
            }
          );
        });
      } else if (typeguards.isRowAddEvent(event)) {
        // Eventually, we will want to implement this - so we do not have to rely on waiting
        // for the response of the API request.
      } else if (typeguards.isRowDeleteEvent(event)) {
        const ids = Array.isArray(event.payload) ? event.payload : [event.payload];
        map(ids, (id: number) => {
          map(
            filter(newState.data, (subaccount: SA) => includes(subaccount.fringes, id)),
            (subaccount: SA) => {
              // NOTE: We have to recalculate the SubAccount metrics, instead of just refringing
              // the value, because the current estimated value on the SubAccount already has fringes
              // applied, and there is no way to refringe an already fringed value if we do not know
              // what the previous fringes were.
              newState = recalculateSubAccountMetrics<S, SA, G>(action, newState, subaccount);
            }
          );
        });
      }
    } else if (action.type === mapping.RemoveFromGroup) {
      newState = removeModelFromGroup<S, SA, G>(action, newState, action.payload);
    } else if (action.type === mapping.AddToGroup) {
      newState = addModelToGroup<S, SA, G>(action, newState, action.payload.id, action.payload.group);
    }
    return newState;
  };
};

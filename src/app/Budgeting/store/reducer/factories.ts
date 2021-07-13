import { Reducer, combineReducers } from "redux";
import { isNil, includes, map, filter, reduce, forEach, uniq } from "lodash";

import {
  createModelListResponseReducer,
  createDetailResponseReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "lib/redux/factories";
import { CommentsListResponseActionMap } from "lib/redux/factories/comments";
import { warnInconsistentState } from "lib/redux/util";
import * as typeguards from "lib/model/typeguards";
import { fringeValue, consolidateTableChange, mergeChangesWithModel } from "lib/model/util";
import { replaceInArray, replaceInArrayDistributedTypes, findWithDistributedTypes } from "lib/util";

import { initialModelListResponseState } from "store/initialState";

type ModelLookup<M extends Model.Model> = number | ((m: M) => boolean);
type MSA<S extends Modules.Budgeting.AccountStoreType | Modules.Budgeting.SubAccountStoreType> =
  S extends Modules.Budgeting.AccountStoreType ? Model.Account : Model.SubAccount;

const findModelInData = <M extends Model.Model, A extends Array<any> = M[]>(
  action: Redux.Action<any>,
  data: A,
  id: ModelLookup<M>,
  name = "Model"
): M | null => {
  const predicate = typeof id === "number" ? (m: M) => m.id === id : id;
  const model = findWithDistributedTypes<M, A>(data, predicate);
  if (!isNil(model)) {
    return model;
  } else {
    warnInconsistentState({
      action: action.type,
      reason: `${name} does not exist in state when it is expected to.`,
      id: id
    });
    return null;
  }
};

const findModelsInData = <M extends Model.Model, A extends Array<any> = M[]>(
  action: Redux.Action<any>,
  data: A,
  ids: ModelLookup<M>[],
  name = "Model"
): M[] =>
  filter(
    map(ids, (predicate: ModelLookup<M>) => findModelInData(action, data, predicate, name)),
    (model: M | null) => model !== null
  ) as M[];

const modelFromState = <M extends Model.Model, A extends Array<any> = M[]>(
  /* eslint-disable indent */
  action: Redux.Action<any>,
  data: A,
  id: ModelLookup<M> | M,
  name = "Model"
): M | null => {
  if (typeof id === "number" || typeof id === "function") {
    return findModelInData<M, A>(action, data, id, name);
  }
  return id;
};

interface FringesReducerFactoryActionMap {
  TableChanged: string;
  Response: string;
  Request: string;
  Loading: string;
  SetSearch: string;
  // This will eventually be removed when we let the reducer respond to
  // the RowAddEvent directly.
  AddToState: string;
  Creating: string;
  Updating: string;
  Deleting: string;
}

export const createFringesReducer = (
  /* eslint-disable indent */
  mapping: FringesReducerFactoryActionMap
): Reducer<Redux.ModelListResponseStore<Model.Fringe>, Redux.Action<any>> => {
  const listResponseReducer = createModelListResponseReducer<Model.Fringe, Redux.ModelListResponseStore<Model.Fringe>>(
    {
      Response: mapping.Response,
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
      strictSelect: false,
      initialState: initialModelListResponseState
    }
  );
  return (
    state: Redux.ModelListResponseStore<Model.Fringe> = initialModelListResponseState,
    action: Redux.Action<any>
  ): Redux.ModelListResponseStore<Model.Fringe> => {
    let newState = listResponseReducer(state, action);
    if (action.type === mapping.TableChanged) {
      const event: Table.ChangeEvent<BudgetTable.FringeRow, Model.Fringe> = action.payload;

      if (typeguards.isDataChangeEvent(event)) {
        const consolidated = consolidateTableChange(event.payload);

        // The consolidateTableChange method should return changes that are grouped by SubAccount,
        // but just in case we apply grouping logic here.
        let changesPerFringe: {
          [key: number]: { changes: Table.RowChange<BudgetTable.FringeRow, Model.Fringe>[]; model: Model.Fringe };
        } = {};
        for (let i = 0; i < consolidated.length; i++) {
          if (isNil(changesPerFringe[consolidated[i].id])) {
            const fringe: Model.Fringe | null = findModelInData<Model.Fringe>(
              action,
              newState.data,
              consolidated[i].id,
              "Fringe"
            );
            if (!isNil(fringe)) {
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
        // For each of the Fringe(s) that were changed, apply those changes to the current
        // Fringe model in state.
        for (let k = 0; k < Object.keys(changesPerFringe).length; k++) {
          const id = parseInt(Object.keys(changesPerFringe)[k]);
          const changesObj = changesPerFringe[id];
          let fringe = changesObj.model;
          for (let j = 0; j < changesObj.changes.length; j++) {
            fringe = mergeChangesWithModel(changesObj.model, changesObj.changes[j]);
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

const groupFromState = <S extends Modules.Budgeting.AccountsStore | Modules.Budgeting.SubAccountsStore>(
  action: Redux.Action<any>,
  st: S,
  id: Model.Group | number,
  subaccountId?: number
): Model.Group | null => {
  if (typeof id === "number") {
    let predicate = (g: Model.Group) => g.id === id;
    if (!isNil(subaccountId)) {
      predicate = (g: Model.Group) => g.id === id && includes(g.children, subaccountId);
    }
    return modelFromState<Model.Group>(action, st.groups.data, predicate, "Group");
  }
  return id;
};

const recalculateGroupMetrics = <S extends Modules.Budgeting.AccountsStore | Modules.Budgeting.SubAccountsStore>(
  /* eslint-disable indent */
  action: Redux.Action<any>,
  st: S,
  group: Model.Group | number
): S => {
  const stateGroup = groupFromState(action, st, group);
  if (!isNil(stateGroup)) {
    const objs = findModelsInData<Model.Account | Model.SubAccount, Model.Account[] | Model.SubAccount[]>(
      action,
      st.data,
      stateGroup.children,
      "Group child account/sub-account"
    );
    let payload: any = {
      estimated: reduce(objs, (sum: number, s: Model.Account | Model.SubAccount) => sum + (s.estimated || 0), 0)
    };
    const actual = reduce(objs, (sum: number, s: Model.Account | Model.SubAccount) => sum + (s.actual || 0), 0);
    payload = { ...payload, actual, variance: payload.estimated - actual };
    return {
      ...st,
      groups: {
        ...st.groups,
        data: replaceInArray<Model.Group>(st.groups.data, { id: stateGroup.id }, { ...stateGroup, ...payload })
      }
    };
  }
  return st;
};

const removeModelFromGroup = <S extends Modules.Budgeting.AccountsStore | Modules.Budgeting.SubAccountsStore>(
  action: Redux.Action<any>,
  st: S,
  model: number | MSA<S>,
  group?: number | Model.Group
): S => {
  const stateModel = modelFromState<Model.Account | Model.SubAccount, Model.Account[] | Model.SubAccount[]>(
    action,
    st.data,
    model
  );
  if (!isNil(stateModel) && !isNil(stateModel.group)) {
    let stateGroup: Model.Group | null;
    if (!isNil(group)) {
      stateGroup = groupFromState<S>(action, st, group, stateModel.id);
    } else {
      stateGroup = groupFromState<S>(action, st, stateModel.group, stateModel.id);
    }
    if (!isNil(stateGroup)) {
      st = {
        ...st,
        data: replaceInArrayDistributedTypes<Model.Account | Model.SubAccount, Model.Account[] | Model.SubAccount[]>(
          st.data,
          { id: stateModel.id },
          { ...stateModel, group: null }
        ),
        groups: {
          ...st.groups,
          data: replaceInArray<Model.Group>(
            st.groups.data,
            { id: stateGroup.id },
            {
              ...stateGroup,
              children: filter(stateGroup.children, (child: number) => child !== stateModel.id)
            }
          )
        }
      };
      return recalculateGroupMetrics<S>(action, st, stateGroup);
    }
  }
  return st;
};

const removeModelFromState = <S extends Modules.Budgeting.AccountsStore | Modules.Budgeting.SubAccountsStore>(
  action: Redux.Action<any>,
  st: S,
  id: number
) => {
  st = removeModelFromGroup<S>(action, st, id);
  return {
    ...st,
    data: filter(st.data, (m: MSA<S>) => m.id !== id),
    count: st.count - 1
  };
};

const addModelToGroup = <S extends Modules.Budgeting.AccountsStore | Modules.Budgeting.SubAccountsStore>(
  action: Redux.Action<any>,
  st: S,
  model: number | MSA<S>,
  group: number | Model.Group
): S => {
  const stateModel = modelFromState<Model.Account | Model.SubAccount, Model.Account[] | Model.SubAccount[]>(
    action,
    st.data,
    model
  );
  if (!isNil(stateModel)) {
    const stateGroup: Model.Group | null = groupFromState<S>(action, st, group, stateModel.id);
    if (!isNil(stateGroup)) {
      if (includes(stateGroup.children, stateModel.id)) {
        warnInconsistentState({
          action,
          reason: "Model already exists as a child for group.",
          id: stateModel.id,
          group: stateGroup.id
        });
      } else {
        st = {
          ...st,
          data: replaceInArrayDistributedTypes<Model.Account | Model.SubAccount, Model.Account[] | Model.SubAccount[]>(
            st.data,
            { id: stateModel.id },
            { ...stateModel, group: stateGroup.id }
          ),
          groups: {
            ...st.groups,
            data: replaceInArray<Model.Group>(
              st.groups.data,
              { id: stateGroup.id },
              {
                ...stateGroup,
                children: [...stateGroup.children, stateModel.id]
              }
            )
          }
        };
        return recalculateGroupMetrics<S>(action, st, stateGroup.id);
      }
    }
  }
  return st;
};

const addGroupToState = <S extends Modules.Budgeting.AccountsStore | Modules.Budgeting.SubAccountsStore>(
  action: Redux.Action<any>,
  st: S,
  group: Model.Group
): S => {
  forEach(group.children, (id: number) => {
    const model = modelFromState<Model.Account | Model.SubAccount, Model.Account[] | Model.SubAccount[]>(
      action,
      st.data,
      id
    );
    if (!isNil(model)) {
      st = {
        ...st,
        data: replaceInArrayDistributedTypes<Model.Account | Model.SubAccount, Model.Account[] | Model.SubAccount[]>(
          st.data,
          { id: model.id },
          { ...model, group: group.id }
        ),
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

const removeGroupFromState = <S extends Modules.Budgeting.AccountsStore | Modules.Budgeting.SubAccountsStore>(
  action: Redux.Action<any>,
  st: S,
  id: number
): S => {
  const group: Model.Group | null = groupFromState<S>(action, st, id);
  if (!isNil(group)) {
    forEach(group.children, (child: number) => {
      st = removeModelFromGroup<S>(action, st, child, group);
    });
    st = {
      ...st,
      groups: {
        ...st.groups,
        data: filter(st.groups.data, (g: Model.Group) => g.id !== id),
        count: st.groups.count - 1
      }
    };
  }
  return st;
};

const updateAccountInState = <S extends Modules.Budgeting.AccountsStore>(
  action: Redux.Action<any>,
  st: S,
  id: number | Model.Account,
  changes: Table.RowChange<BudgetTable.AccountRow, Model.Account>[]
): S => {
  let account = modelFromState<Model.Account>(action, st.data, id);
  if (!isNil(account)) {
    for (let j = 0; j < changes.length; j++) {
      account = mergeChangesWithModel(account, changes[j]);
    }
    st = {
      ...st,
      data: replaceInArray<Model.Account>(st.data, { id: account.id }, account)
    };
    // NOTE: We do not need to update the metrics for the account because there
    // are no changes to an account that would warrant recalculations of the
    // account on the page.
    if (!isNil(account.group)) {
      st = recalculateGroupMetrics<S>(action, st, account.group);
    }
  }
  return st;
};

export const createAccountsReducer = <S extends Modules.Budgeting.AccountsStore>(
  /* eslint-disable indent */
  mapping: AccountsReducerFactoryActionMap,
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
  const listResponseReducer = createModelListResponseReducer<Model.Account, S>(
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
        groups: createModelListResponseReducer<Model.Group, Redux.ModelListResponseStore<Model.Group>>({
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
      const group: Model.Group = action.payload;
      newState = recalculateGroupMetrics<S>(action, newState, group.id);
    } else if (action.type === mapping.Groups.AddToState) {
      const group: Model.Group = action.payload;
      newState = addGroupToState<S>(action, newState, group);
    } else if (action.type === mapping.Groups.RemoveFromState) {
      newState = removeGroupFromState<S>(action, newState, action.payload);
    } else if (action.type === mapping.TableChanged) {
      const event: Table.ChangeEvent<BudgetTable.AccountRow, Model.Account> = action.payload;

      if (typeguards.isDataChangeEvent(event)) {
        const consolidated = consolidateTableChange(event.payload);

        // The consolidated changes should contain one change per account, but
        // just in case we apply that grouping logic here.
        let changesPerAccount: {
          [key: number]: { changes: Table.RowChange<BudgetTable.AccountRow, Model.Account>[]; model: Model.Account };
        } = {};
        for (let i = 0; i < consolidated.length; i++) {
          if (isNil(changesPerAccount[consolidated[i].id])) {
            const account: Model.Account | null = modelFromState<Model.Account>(
              action,
              newState.data,
              consolidated[i].id
            );
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
          newState = updateAccountInState<S>(action, newState, changesObj.model, changesObj.changes);
        }
      } else if (typeguards.isRowAddEvent(event)) {
        // Eventually, we will want to implement this - so we do not have to rely on waiting
        // for the response of the API request.
      } else if (typeguards.isRowDeleteEvent(event)) {
        const ids = Array.isArray(event.payload) ? event.payload : [event.payload];
        for (let i = 0; i < ids.length; i++) {
          newState = removeModelFromState<S>(action, newState, ids[i]);
        }
      }
    } else if (action.type === mapping.RemoveFromGroup) {
      newState = removeModelFromGroup<S>(action, newState, action.payload);
    } else if (action.type === mapping.AddToGroup) {
      newState = addModelToGroup<S>(action, newState, action.payload.id, action.payload.group);
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

interface SubAccountsReducerFactoryActionMap {
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
  History?: SubAccountsHistoryActionMap;
}

const recalculateSubAccountMetrics = <S extends Modules.Budgeting.SubAccountsStore>(
  /* eslint-disable indent */
  action: Redux.Action<any>,
  st: S,
  fringesState: Redux.ModelListResponseStore<Model.Fringe>,
  sub: Model.SubAccount
): S => {
  const subAccount: Model.SubAccount | null = modelFromState<Model.SubAccount>(action, st.data, sub);
  if (!isNil(subAccount)) {
    let newSubAccount = { ...subAccount };
    /*
    In the case that the SubAccount has SubAccount(s) itself, the estimated value is determined
    from the accumulation of the estimated values for those children SubAccount(s).  In this
    case,  we do not need to update the SubAccount estimated value in state because it only
    changes when the estimated values of it's SubAccount(s) on another page are altered.
    */
    if (newSubAccount.subaccounts.length === 0 && !isNil(newSubAccount.quantity) && !isNil(newSubAccount.rate)) {
      const multiplier = newSubAccount.multiplier || 1.0;
      let payload: any = {
        estimated: multiplier * newSubAccount.quantity * newSubAccount.rate
      };
      if (!isNil(newSubAccount.actual) && !isNil(payload.estimated)) {
        payload = { ...payload, variance: payload.estimated - newSubAccount.actual };
      }
      newSubAccount = { ...newSubAccount, ...payload };

      // Reapply the fringes to the SubAccount's estimated value.
      newSubAccount = {
        ...newSubAccount,
        estimated: fringeValue(
          newSubAccount.estimated,
          findModelsInData(action, fringesState.data, newSubAccount.fringes, "Fringe")
        )
      };
      return {
        ...st,
        data: replaceInArray<Model.SubAccount>(st.data, { id: newSubAccount.id }, newSubAccount)
      };
    }
  }
  return st;
};

const updateSubAccountInState = <S extends Modules.Budgeting.SubAccountsStore>(
  action: Redux.Action<any>,
  st: S,
  fringesState: Redux.ModelListResponseStore<Model.Fringe>,
  id: number | Model.SubAccount,
  changes: Table.RowChange<BudgetTable.SubAccountRow, Model.SubAccount>[]
) => {
  let subAccount: Model.SubAccount | null = modelFromState<Model.SubAccount>(action, st.data, id);
  if (!isNil(subAccount)) {
    for (let j = 0; j < changes.length; j++) {
      subAccount = mergeChangesWithModel(subAccount, changes[j]);
    }
    st = {
      ...st,
      data: replaceInArray<Model.SubAccount>(st.data, { id: subAccount.id }, subAccount)
    };
    st = recalculateSubAccountMetrics<S>(action, st, fringesState, subAccount);
    if (!isNil(subAccount.group)) {
      st = recalculateGroupMetrics<S>(action, st, subAccount.group);
    }
  }
  return st;
};

export const createSubAccountsReducer = <S extends Modules.Budgeting.SubAccountsStore>(
  mapping: SubAccountsReducerFactoryActionMap,
  initialState: S
): Reducer<S, Redux.Action<any>> => {
  let historySubReducers = {};
  if (!isNil(mapping.History)) {
    historySubReducers = {
      history: createModelListResponseReducer<Model.HistoryEvent>(mapping.History)
    };
  }
  const listResponseReducer = createModelListResponseReducer<Model.SubAccount, S>(
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
        groups: createModelListResponseReducer<Model.Group>(mapping.Groups),
        ...historySubReducers
      }
    }
  );
  return (state: S = initialState, action: Redux.Action<any>): S => {
    let newState = { ...state };

    newState = listResponseReducer(newState, action);

    if (action.type === mapping.Groups.UpdateInState) {
      const group: Model.Group = action.payload;
      newState = recalculateGroupMetrics<S>(action, newState, group.id);
    } else if (action.type === mapping.Groups.AddToState) {
      const group: Model.Group = action.payload;
      newState = addGroupToState<S>(action, newState, group);
    } else if (action.type === mapping.Groups.RemoveFromState) {
      newState = removeGroupFromState<S>(action, newState, action.payload);
    } else if (action.type === mapping.RemoveFromGroup) {
      newState = removeModelFromGroup<S>(action, newState, action.payload);
    } else if (action.type === mapping.AddToGroup) {
      newState = addModelToGroup<S>(action, newState, action.payload.id, action.payload.group);
    }
    return newState;
  };
};

interface AccountSubAccountReducerFactoryActionMap {
  SetId: string;
  Request: string;
  Response: string;
  Loading: string;
  UpdateInState: string;
  TableChanged: string;
  SubAccounts: SubAccountsReducerFactoryActionMap;
  Fringes: FringesReducerFactoryActionMap;
  // Comments only applicable in the Budget case (not the Template case).
  Comments?: Partial<CommentsListResponseActionMap>;
}

export const createAccountReducer = <
  S extends Modules.Budgeting.Budget.AccountStore | Modules.Budgeting.Template.AccountStore
>(
  mapping: AccountSubAccountReducerFactoryActionMap,
  initialState: S
): Reducer<S, Redux.Action<any>> => {
  type SASS = Modules.Budgeting.Budget.SubAccountsStore | Modules.Budgeting.Template.SubAccountsStore;

  const isBudgetAccountStore = (
    store: Modules.Budgeting.Budget.AccountStore | Modules.Budgeting.Template.AccountStore
  ): store is Modules.Budgeting.Budget.AccountStore => {
    return (store as Modules.Budgeting.Budget.AccountStore).comments !== undefined;
  };

  let reducers: { [key: string]: Reducer<any, Redux.Action<any>> } = {
    id: createSimplePayloadReducer<number | null>(mapping.SetId, null),
    detail: createDetailResponseReducer<Model.Account, Redux.ModelDetailResponseStore<Model.Account>, Redux.Action>({
      Response: mapping.Response,
      Loading: mapping.Loading,
      Request: mapping.Request,
      UpdateInState: mapping.UpdateInState
    }),
    fringes: createFringesReducer(mapping.Fringes),
    subaccounts: createSubAccountsReducer<SASS>(mapping.SubAccounts, initialState.subaccounts),
    type: (s: S = initialState, action: Redux.Action<any>) => s // Identity Reducer
  };
  if (!isNil(mapping.Comments) && isBudgetAccountStore(initialState)) {
    reducers = { ...reducers, comments: createCommentsListResponseReducer(mapping.Comments) };
  }
  /*
    NOTE: Because of the typing around the difference between the Modules.Budgeting.Budget.AccountStore
    and Modules.Budgeting.Template.AccountStore, in regard specifically to the comments
    and the fact that we are optionally providing them in the Mapping, we have to type this
    Reducer with generic parameter S = any, which isn't ideal.
  */
  const genericReducer: Reducer<any, Redux.Action<any>> = combineReducers(reducers);

  return (state: S = initialState, action: Redux.Action<any>) => {
    let newState: S = genericReducer(state, action);

    // When an Account's underlying subaccounts are removed, updated or added,
    // or the Fringes are changed, we need to update/recalculate the Account.
    if (action.type === mapping.TableChanged || action.type === mapping.Fringes.TableChanged) {
      // If the table change referred to a change to a SubAccount in the table, then we need to
      // update that SubAccount in state.
      if (action.type === mapping.TableChanged) {
        const event: Table.ChangeEvent<BudgetTable.AccountRow, Model.Account> = action.payload;
        if (typeguards.isDataChangeEvent(event)) {
          const consolidated = consolidateTableChange(event.payload);

          // The consolidated changes should contain one change per sub account, but
          // just in case we apply that grouping logic here.
          let changesPerSubAccount: {
            [key: number]: {
              changes: Table.RowChange<BudgetTable.AccountRow, Model.Account>[];
              model: Model.SubAccount;
            };
          } = {};
          for (let i = 0; i < consolidated.length; i++) {
            if (isNil(changesPerSubAccount[consolidated[i].id])) {
              const subAccount: Model.SubAccount | null = modelFromState<Model.SubAccount>(
                action,
                newState.subaccounts.data,
                consolidated[i].id
              );
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
            // Apply each relevant change, performing recalculations
            newState = {
              ...newState,
              subaccounts: updateSubAccountInState<SASS>(
                action,
                newState.subaccounts,
                newState.fringes,
                changesObj.model,
                changesObj.changes
              )
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
              subaccounts: removeModelFromState<SASS>(action, newState.subaccounts, ids[i])
            };
          }
        }
      } else if (action.type === mapping.Fringes.TableChanged) {
        // Since the Fringes are displayed in a modal and not on a separate page, when a Fringe is
        // changed we need to recalculate the SubAcccount(s) that have that Fringe so they display
        // estimated values that are consistent with the change to the Fringe.
        const event: Table.ChangeEvent<BudgetTable.FringeRow, Model.Fringe> = action.payload;

        if (typeguards.isDataChangeEvent(event)) {
          // We don't have to be concerned with the individual changes for each Fringe,
          // just the Fringe IDs of the Fringes that changed.  This is because the changes
          // will have already been applied to the individual Fringe(s).
          const consolidated = consolidateTableChange(event.payload);
          const ids = uniq(
            map(consolidated, (change: Table.RowChange<BudgetTable.FringeRow, Model.Fringe>) => change.id)
          );
          map(ids, (id: number) => {
            map(
              filter(newState.subaccounts.data, (subaccount: Model.SubAccount) => includes(subaccount.fringes, id)),
              (subaccount: Model.SubAccount) => {
                // NOTE: We have to recalculate the SubAccount metrics, instead of just refringing
                // the value, because the current estimated value on the SubAccount already has fringes
                // applied, and there is no way to refringe an already fringed value if we do not know
                // what the previous fringes were.
                newState = {
                  ...newState,
                  subaccounts: recalculateSubAccountMetrics<SASS>(
                    action,
                    newState.subaccounts,
                    newState.fringes,
                    subaccount
                  )
                };
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
              filter(newState.subaccounts.data, (subaccount: Model.SubAccount) => includes(subaccount.fringes, id)),
              (subaccount: Model.SubAccount) => {
                newState = {
                  ...newState,
                  subaccounts: recalculateSubAccountMetrics<SASS>(
                    action,
                    newState.subaccounts,
                    newState.fringes,
                    subaccount
                  )
                };
              }
            );
          });
        }
      }
      // Update the overall Account based on the underlying SubAccount(s) present.
      let subAccounts: Model.SubAccount[] = newState.subaccounts.data;
      let newData: { estimated: number; actual?: number; variance?: number } = {
        estimated: reduce(subAccounts, (sum: number, s: Model.SubAccount) => sum + (s.estimated || 0), 0)
      };
      // If we are dealing with the Budget case (and not the Template case) we need to also update
      // the overall Account's actual and variance values.
      const actual = reduce(subAccounts, (sum: number, s: Model.SubAccount) => sum + (s.actual || 0), 0);
      newData = { ...newData, actual, variance: newData.estimated - actual };
      if (!isNil(newState.detail.data)) {
        newState = {
          ...newState,
          detail: {
            ...newState.detail,
            data: {
              ...newState.detail.data,
              ...newData
            }
          }
        };
      }
    }
    return newState;
  };
};

export const createSubAccountReducer = <
  S extends Modules.Budgeting.Budget.SubAccountStore | Modules.Budgeting.Template.SubAccountStore
>(
  mapping: AccountSubAccountReducerFactoryActionMap,
  initialState: S
): Reducer<S, Redux.Action<any>> => {
  type SASS = Modules.Budgeting.Budget.SubAccountsStore | Modules.Budgeting.Template.SubAccountsStore;

  const isBudgetSubAccountStore = (
    store: Modules.Budgeting.Budget.SubAccountStore | Modules.Budgeting.Template.SubAccountStore
  ): store is Modules.Budgeting.Budget.SubAccountStore => {
    return (store as Modules.Budgeting.Budget.SubAccountStore).comments !== undefined;
  };

  let reducers: { [key: string]: Reducer<any, Redux.Action<any>> } = {
    id: createSimplePayloadReducer<number | null>(mapping.SetId, null),
    detail: createDetailResponseReducer<
      Model.SubAccount,
      Redux.ModelDetailResponseStore<Model.SubAccount>,
      Redux.Action
    >({
      Response: mapping.Response,
      Loading: mapping.Loading,
      Request: mapping.Request,
      UpdateInState: mapping.UpdateInState
    }),
    fringes: createFringesReducer(mapping.Fringes),
    subaccounts: createSubAccountsReducer<SASS>(mapping.SubAccounts, initialState.subaccounts),
    type: (s: S = initialState, action: Redux.Action<any>) => s // Identity Reducer
  };
  if (!isNil(mapping.Comments) && isBudgetSubAccountStore(initialState)) {
    reducers = { ...reducers, comments: createCommentsListResponseReducer(mapping.Comments) };
  }
  /*
    NOTE: Because of the typing around the difference between the Modules.Budgeting.Budget.AccountStore
    and Modules.Budgeting.Template.AccountStore, in regard specifically to the comments
    and the fact that we are optionally providing them in the Mapping, we have to type this
    Reducer with generic parameter S = any, which isn't ideal.
  */
  const genericReducer: Reducer<any, Redux.Action<any>> = combineReducers(reducers);

  return (state: S = initialState, action: Redux.Action<any>) => {
    let newState: S = genericReducer(state, action);

    // When a SubAccount's underlying subaccounts are removed, updated or added,
    // or the Fringes are changed, we need to update/recalculate the SubAccount.
    if (action.type === mapping.TableChanged || action.type === mapping.Fringes.TableChanged) {
      // If the table change referred to a change to a SubAccount in the table, then we need to
      // update that SubAccount in state.
      if (action.type === mapping.TableChanged) {
        const event: Table.ChangeEvent<BudgetTable.SubAccountRow, Model.SubAccount> = action.payload;
        if (typeguards.isDataChangeEvent(event)) {
          const consolidated = consolidateTableChange(event.payload);

          // The consolidated changes should contain one change per sub account, but
          // just in case we apply that grouping logic here.
          let changesPerSubAccount: {
            [key: number]: {
              changes: Table.RowChange<BudgetTable.SubAccountRow, Model.SubAccount>[];
              model: Model.SubAccount;
            };
          } = {};
          for (let i = 0; i < consolidated.length; i++) {
            if (isNil(changesPerSubAccount[consolidated[i].id])) {
              const subAccount: Model.SubAccount | null = modelFromState<Model.SubAccount>(
                action,
                newState.subaccounts.data,
                consolidated[i].id
              );
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
            // Apply each relevant change, performing recalculations
            newState = {
              ...newState,
              subaccounts: updateSubAccountInState<SASS>(
                action,
                newState.subaccounts,
                newState.fringes,
                changesObj.model,
                changesObj.changes
              )
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
              subaccounts: removeModelFromState<SASS>(action, newState.subaccounts, ids[i])
            };
          }
        }
      } else if (action.type === mapping.Fringes.TableChanged) {
        // Since the Fringes are displayed in a modal and not on a separate page, when a Fringe is
        // changed we need to recalculate the SubAcccount(s) that have that Fringe so they display
        // estimated values that are consistent with the change to the Fringe.
        const event: Table.ChangeEvent<BudgetTable.FringeRow, Model.Fringe> = action.payload;

        if (typeguards.isDataChangeEvent(event)) {
          // We don't have to be concerned with the individual changes for each Fringe,
          // just the Fringe IDs of the Fringes that changed.  This is because the changes
          // will have already been applied to the individual Fringe(s).
          const consolidated = consolidateTableChange(event.payload);
          const ids = uniq(
            map(consolidated, (change: Table.RowChange<BudgetTable.FringeRow, Model.Fringe>) => change.id)
          );
          map(ids, (id: number) => {
            map(
              filter(newState.subaccounts.data, (subaccount: Model.SubAccount) => includes(subaccount.fringes, id)),
              (subaccount: Model.SubAccount) => {
                // NOTE: We have to recalculate the SubAccount metrics, instead of just refringing
                // the value, because the current estimated value on the SubAccount already has fringes
                // applied, and there is no way to refringe an already fringed value if we do not know
                // what the previous fringes were.
                newState = {
                  ...newState,
                  subaccounts: recalculateSubAccountMetrics<SASS>(
                    action,
                    newState.subaccounts,
                    newState.fringes,
                    subaccount
                  )
                };
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
              filter(newState.subaccounts.data, (subaccount: Model.SubAccount) => includes(subaccount.fringes, id)),
              (subaccount: Model.SubAccount) => {
                newState = {
                  ...newState,
                  subaccounts: recalculateSubAccountMetrics<SASS>(
                    action,
                    newState.subaccounts,
                    newState.fringes,
                    subaccount
                  )
                };
              }
            );
          });
        }
      }
      // Update the overall Account based on the underlying SubAccount(s) present.
      let subAccounts: Model.SubAccount[] = newState.subaccounts.data;
      let newData: { estimated: number; actual?: number; variance?: number } = {
        estimated: reduce(subAccounts, (sum: number, s: Model.SubAccount) => sum + (s.estimated || 0), 0)
      };
      // If we are dealing with the Budget case (and not the Template case) we need to also update
      // the overall Account's actual and variance values.
      const actual = reduce(subAccounts, (sum: number, s: Model.SubAccount) => sum + (s.actual || 0), 0);
      newData = { ...newData, actual, variance: newData.estimated - actual };
      if (!isNil(newState.detail.data)) {
        newState = {
          ...newState,
          detail: {
            ...newState.detail,
            data: {
              ...newState.detail.data,
              ...newData
            }
          }
        };
      }
    }
    return newState;
  };
};

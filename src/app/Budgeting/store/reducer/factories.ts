import { Reducer, combineReducers } from "redux";
import { isNil, includes, map, filter, reduce, forEach, uniq } from "lodash";

import {
  createModelListResponseReducer,
  createDetailResponseReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer
} from "lib/redux/factories";
import { CommentsListResponseActionMap } from "lib/redux/factories/comments";
import { warnInconsistentState, identityReducer } from "lib/redux/util";
import * as typeguards from "lib/model/typeguards";
import { fringeValue, consolidateTableChange, mergeChangesWithModel } from "lib/model/util";
import { replaceInArray, findWithDistributedTypes } from "lib/util";

import { initialModelListResponseState } from "store/initialState";

type EntityStore<M extends Model.Model = Model.Budget | Model.Template> =
  | Modules.Budget.BudgetStore<M>
  | Modules.Budget.AccountStore
  | Modules.Budget.SubAccountStore;

type ModelLookup<M extends Model.Model> = number | ((m: M) => boolean);

type FindModelOptions = {
  readonly warnIfMissing?: boolean;
  readonly name?: string;
};

const findModelInData = <M extends Model.Model, A extends Array<any> = M[]>(
  action: Redux.Action<any>,
  data: A,
  id: ModelLookup<M>,
  options: FindModelOptions = { name: "Model", warnIfMissing: true }
): M | null => {
  const predicate = typeof id === "number" ? (m: M) => m.id === id : id;
  const model = findWithDistributedTypes<M, A>(data, predicate);
  if (!isNil(model)) {
    return model;
  } else {
    if (options.warnIfMissing !== false) {
      warnInconsistentState({
        action: action.type,
        reason: `${options.name || "Model"} does not exist in state when it is expected to.`,
        id: id
      });
    }
    return null;
  }
};

const findModelsInData = <M extends Model.Model, A extends Array<any> = M[]>(
  action: Redux.Action<any>,
  data: A,
  ids: ModelLookup<M>[],
  options: FindModelOptions = { name: "Model", warnIfMissing: true }
): M[] =>
  filter(
    map(ids, (predicate: ModelLookup<M>) => findModelInData(action, data, predicate, options)),
    (model: M | null) => model !== null
  ) as M[];

const modelFromState = <M extends Model.Model, A extends Array<any> = M[]>(
  /* eslint-disable indent */
  action: Redux.Action<any>,
  data: A,
  id: ModelLookup<M> | M,
  options: FindModelOptions = { name: "Model", warnIfMissing: true }
): M | null => {
  if (typeof id === "number" || typeof id === "function") {
    return findModelInData<M, A>(action, data, id, options);
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
              { name: "Fringe" }
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

const groupFromState = <S extends EntityStore>(
  action: Redux.Action<any>,
  st: S,
  id: Model.Group | number,
  lineId?: number,
  options: FindModelOptions = { name: "Group", warnIfMissing: true }
): Model.Group | null => {
  if (typeof id === "number") {
    let predicate = (g: Model.Group) => g.id === id;
    if (!isNil(lineId)) {
      predicate = (g: Model.Group) => g.id === id && includes(g.children, lineId);
    }
    return modelFromState<Model.Group>(action, st.groups.data, predicate, options);
  }
  return id;
};

const modelGroupFromState = <S extends EntityStore>(
  action: Redux.Action<any>,
  st: S,
  lineId: number,
  options: FindModelOptions = { warnIfMissing: true }
): Model.Group | null => {
  const predicate = (g: Model.Group) => includes(g.children, lineId);
  return modelFromState<Model.Group>(action, st.groups.data, predicate, { ...options, name: "Group" });
};

const recalculateGroupMetrics = <S extends EntityStore>(
  /* eslint-disable indent */
  action: Redux.Action<any>,
  st: S,
  group: Model.Group | number
): S => {
  const stateGroup = groupFromState<S>(action, st, group);
  if (!isNil(stateGroup)) {
    const objs = findModelsInData<Model.Account | Model.SubAccount, Model.Account[] | Model.SubAccount[]>(
      action,
      st.children.data,
      stateGroup.children,
      { name: "Group child account/sub-account" }
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

const removeModelFromGroup = <S extends EntityStore>(
  action: Redux.Action<any>,
  st: S,
  model: number | Model.Account | Model.SubAccount,
  group?: number | Model.Group | undefined,
  options: FindModelOptions = { warnIfMissing: true }
): S => {
  const stateModel = modelFromState<Model.Account | Model.SubAccount, Model.Account[] | Model.SubAccount[]>(
    action,
    st.children.data,
    model
  );
  if (!isNil(stateModel)) {
    const stateGroup: Model.Group | null = isNil(group)
      ? modelGroupFromState<S>(action, st, stateModel.id, options)
      : groupFromState<S>(action, st, group, stateModel.id, options);
    if (!isNil(stateGroup)) {
      const newGroup = {
        ...stateGroup,
        children: filter(stateGroup.children, (child: number) => child !== stateModel.id)
      };
      st = {
        ...st,
        groups: {
          ...st.groups,
          data: replaceInArray<Model.Group>(st.groups.data, { id: stateGroup.id }, newGroup)
        }
      };
      return recalculateGroupMetrics<S>(action, st, newGroup);
    }
  }
  return st;
};

const removeModelFromState = <S extends EntityStore>(action: Redux.Action<any>, st: S, id: number) => {
  st = removeModelFromGroup<S>(action, st, id, undefined, { warnIfMissing: false });
  return {
    ...st,
    children: {
      ...st.children,
      data: filter(st.children.data, (m: Model.Account | Model.SubAccount) => m.id !== id),
      count: st.children.count - 1
    }
  };
};

const addModelToGroup = <S extends EntityStore>(
  action: Redux.Action<any>,
  st: S,
  model: number | Model.Account | Model.SubAccount,
  group: number | Model.Group
): S => {
  const stateModel = modelFromState<Model.Account | Model.SubAccount, Model.Account[] | Model.SubAccount[]>(
    action,
    st.children.data,
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

const removeGroupFromState = <S extends EntityStore>(action: Redux.Action<any>, st: S, id: number): S => {
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

const recalculateSubAccountMetrics = <S extends Modules.Budget.SubAccountStore | Modules.Budget.AccountStore>(
  /* eslint-disable indent */
  action: Redux.Action<any>,
  st: S,
  sub: Model.SubAccount
): S => {
  const subAccount: Model.SubAccount | null = modelFromState<Model.SubAccount>(action, st.children.data, sub);
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
          findModelsInData(action, st.fringes.data, newSubAccount.fringes, { name: "Fringe" })
        )
      };
      return {
        ...st,
        children: {
          ...st.children,
          data: replaceInArray<Model.SubAccount>(st.children.data, { id: newSubAccount.id }, newSubAccount)
        }
      };
    }
  }
  return st;
};

const updateSubAccountInState = <S extends Modules.Budget.SubAccountStore | Modules.Budget.AccountStore>(
  action: Redux.Action<any>,
  st: S,
  id: number | Model.SubAccount,
  changes: Table.RowChange<BudgetTable.SubAccountRow, Model.SubAccount>[]
): S => {
  let subAccount: Model.SubAccount | null = modelFromState<Model.SubAccount>(action, st.children.data, id);
  if (!isNil(subAccount)) {
    for (let j = 0; j < changes.length; j++) {
      subAccount = mergeChangesWithModel(subAccount, changes[j]);
    }
    st = {
      ...st,
      children: {
        ...st.children,
        data: replaceInArray<Model.SubAccount>(st.children.data, { id: subAccount.id }, subAccount)
      }
    };
    st = recalculateSubAccountMetrics(action, st, subAccount);
    // The Group might not necessarily exist.
    const subAccountGroup = modelGroupFromState<S>(action, st, subAccount.id, { name: "Group", warnIfMissing: false });
    if (!isNil(subAccountGroup)) {
      st = recalculateGroupMetrics<S>(action, st, subAccountGroup);
    }
  }
  return st;
};

const updateAccountInState = <S extends Modules.Budget.BudgetStore<Model.Template | Model.Budget>>(
  action: Redux.Action<any>,
  st: S,
  id: number | Model.Account,
  changes: Table.RowChange<BudgetTable.AccountRow, Model.Account>[]
): S => {
  let account = modelFromState<Model.Account>(action, st.children.data, id);
  if (!isNil(account)) {
    for (let j = 0; j < changes.length; j++) {
      account = mergeChangesWithModel(account, changes[j]);
    }
    st = {
      ...st,
      children: {
        ...st.children,
        data: replaceInArray<Model.Account>(st.children.data, { id: account.id }, account)
      }
    };
    // NOTE: We do not need to update the metrics for the account because there
    // are no changes to an account that would warrant recalculations of the
    // account on the page.
    // The Group might not necessarily exist.
    const accountGroup = modelGroupFromState<S>(action, st, account.id, { name: "Group", warnIfMissing: false });
    if (!isNil(accountGroup)) {
      st = recalculateGroupMetrics<S>(action, st, accountGroup);
    }
  }
  return st;
};

interface GroupsActionMap {
  Response: string;
  Request: string;
  Loading: string;
  RemoveFromState: string;
  UpdateInState: string;
  AddToState: string;
  Deleting: string;
}

interface HistoryActionMap {
  Response: string;
  Request: string;
  Loading: string;
}

interface AccountsSubAccountsActionMap {
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
}

type BudgetTemplateReducerFactoryActionMap = {
  SetId: string;
  Request: string;
  Response: string;
  Loading: string;
  TableChanged: string;
  Accounts: AccountsSubAccountsActionMap;
  Groups: GroupsActionMap;
  // History only applicable in the Budget case (not the Template case).
  History?: HistoryActionMap;
  // Comments only applicable in the Budget case (not the Template case).
  Comments?: Partial<CommentsListResponseActionMap>;
};

type AccountSubAccountReducerFactoryActionMap = Omit<BudgetTemplateReducerFactoryActionMap, "Accounts"> & {
  UpdateInState: string;
  SubAccounts: AccountsSubAccountsActionMap;
  Fringes: FringesReducerFactoryActionMap;
};

export const createBudgetReducer = <M extends Model.Budget | Model.Template>(
  mapping: BudgetTemplateReducerFactoryActionMap,
  initialState: Modules.Budget.BudgetStore<M>
): Reducer<Modules.Budget.BudgetStore<M>, Redux.Action<any>> => {
  const genericReducer: Reducer<Modules.Budget.BudgetStore<M>, Redux.Action<any>> = combineReducers({
    id: createSimplePayloadReducer<number | null>(mapping.SetId, null),
    detail: createDetailResponseReducer<M, Redux.ModelDetailResponseStore<M>, Redux.Action>({
      Response: mapping.Response,
      Loading: mapping.Loading,
      Request: mapping.Request
    }),
    children: createModelListResponseReducer<Model.Account>({
      Response: mapping.Accounts.Response,
      Request: mapping.Accounts.Request,
      Loading: mapping.Accounts.Loading,
      SetSearch: mapping.Accounts.SetSearch,
      // This will eventually be removed when we let the reducer respond to
      // the RowAddEvent directly.
      AddToState: mapping.Accounts.AddToState,
      Deleting: mapping.Accounts.Deleting,
      Updating: mapping.Accounts.Updating,
      Creating: mapping.Accounts.Creating
    }),
    groups: createModelListResponseReducer<Model.Group>({
      Response: mapping.Groups.Response,
      Loading: mapping.Groups.Loading,
      Request: mapping.Groups.Request,
      UpdateInState: mapping.Groups.UpdateInState,
      AddToState: mapping.Groups.AddToState,
      Deleting: mapping.Groups.Deleting
    }),
    comments: !isNil(mapping.Comments)
      ? createCommentsListResponseReducer(mapping.Comments)
      : identityReducer<Redux.ModelListResponseStore<Model.Comment>>(initialModelListResponseState),
    history: !isNil(mapping.History)
      ? createModelListResponseReducer<Model.HistoryEvent>(mapping.History)
      : identityReducer<Redux.ModelListResponseStore<Model.HistoryEvent>>(initialModelListResponseState)
  });

  return (state: Modules.Budget.BudgetStore<M> = initialState, action: Redux.Action<any>) => {
    let newState: Modules.Budget.BudgetStore<M> = genericReducer(state, action);
    if (action.type === mapping.Groups.UpdateInState) {
      const group: Model.Group = action.payload;
      newState = recalculateGroupMetrics<Modules.Budget.BudgetStore<M>>(action, newState, group.id);
    } else if (action.type === mapping.Groups.RemoveFromState) {
      newState = removeGroupFromState<Modules.Budget.BudgetStore<M>>(action, newState, action.payload);
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
              newState.children.data,
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
          newState = updateAccountInState<Modules.Budget.BudgetStore<M>>(
            action,
            newState,
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
          newState = removeModelFromState<Modules.Budget.BudgetStore<M>>(action, newState, ids[i]);
        }
      }
    } else if (action.type === mapping.Accounts.RemoveFromGroup) {
      newState = removeModelFromGroup<Modules.Budget.BudgetStore<M>>(action, newState, action.payload);
    } else if (action.type === mapping.Accounts.AddToGroup) {
      newState = addModelToGroup<Modules.Budget.BudgetStore<M>>(
        action,
        newState,
        action.payload.id,
        action.payload.group
      );
    }

    return newState;
  };
};

export const createAccountReducer = (
  mapping: AccountSubAccountReducerFactoryActionMap,
  initialState: Modules.Budget.AccountStore
): Reducer<Modules.Budget.AccountStore, Redux.Action<any>> => {
  const genericReducer: Reducer<Modules.Budget.AccountStore, Redux.Action<any>> = combineReducers({
    id: createSimplePayloadReducer<number | null>(mapping.SetId, null),
    detail: createDetailResponseReducer<Model.Account, Redux.ModelDetailResponseStore<Model.Account>, Redux.Action>({
      Response: mapping.Response,
      Loading: mapping.Loading,
      Request: mapping.Request,
      UpdateInState: mapping.UpdateInState
    }),
    fringes: createFringesReducer(mapping.Fringes),
    children: createModelListResponseReducer<Model.SubAccount>({
      Response: mapping.SubAccounts.Response,
      Request: mapping.SubAccounts.Request,
      Loading: mapping.SubAccounts.Loading,
      SetSearch: mapping.SubAccounts.SetSearch,
      AddToState: mapping.SubAccounts.AddToState,
      Deleting: mapping.SubAccounts.Deleting,
      Updating: mapping.SubAccounts.Updating,
      Creating: mapping.SubAccounts.Creating
    }),
    groups: createModelListResponseReducer<Model.Group>({
      Response: mapping.Groups.Response,
      Loading: mapping.Groups.Loading,
      Request: mapping.Groups.Request,
      UpdateInState: mapping.Groups.UpdateInState,
      AddToState: mapping.Groups.AddToState,
      Deleting: mapping.Groups.Deleting
    }),
    comments: !isNil(mapping.Comments)
      ? createCommentsListResponseReducer(mapping.Comments)
      : identityReducer<Redux.ModelListResponseStore<Model.Comment>>(initialModelListResponseState),
    history: !isNil(mapping.History)
      ? createModelListResponseReducer<Model.HistoryEvent>(mapping.History)
      : identityReducer<Redux.ModelListResponseStore<Model.HistoryEvent>>(initialModelListResponseState)
  });

  return (state: Modules.Budget.AccountStore = initialState, action: Redux.Action<any>) => {
    let newState: Modules.Budget.AccountStore = genericReducer(state, action);

    if (action.type === mapping.Groups.UpdateInState) {
      const group: Model.Group = action.payload;
      newState = recalculateGroupMetrics<Modules.Budget.AccountStore>(action, newState, group.id);
    } else if (action.type === mapping.Groups.RemoveFromState) {
      newState = removeGroupFromState<Modules.Budget.AccountStore>(action, newState, action.payload);
    } else if (action.type === mapping.SubAccounts.RemoveFromGroup) {
      newState = removeModelFromGroup<Modules.Budget.AccountStore>(action, newState, action.payload);
    } else if (action.type === mapping.SubAccounts.AddToGroup) {
      newState = addModelToGroup<Modules.Budget.AccountStore>(
        action,
        newState,
        action.payload.id,
        action.payload.group
      );
    }
    // When an Account's underlying subaccounts are removed, updated or added,
    // or the Fringes are changed, we need to update/recalculate the Account.
    else if (action.type === mapping.TableChanged || action.type === mapping.Fringes.TableChanged) {
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
                newState.children.data,
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
            newState = updateSubAccountInState<Modules.Budget.AccountStore>(
              action,
              newState,
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
            newState = removeModelFromState<Modules.Budget.AccountStore>(action, newState, ids[i]);
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
              filter(newState.children.data, (subaccount: Model.SubAccount) => includes(subaccount.fringes, id)),
              (subaccount: Model.SubAccount) => {
                // NOTE: We have to recalculate the SubAccount metrics, instead of just refringing
                // the value, because the current estimated value on the SubAccount already has fringes
                // applied, and there is no way to refringe an already fringed value if we do not know
                // what the previous fringes were.
                newState = recalculateSubAccountMetrics<Modules.Budget.AccountStore>(action, newState, subaccount);
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
              filter(newState.children.data, (subaccount: Model.SubAccount) => includes(subaccount.fringes, id)),
              (subaccount: Model.SubAccount) => {
                newState = recalculateSubAccountMetrics<Modules.Budget.AccountStore>(action, newState, subaccount);
              }
            );
          });
        }
      }
      // Update the overall Account based on the underlying SubAccount(s) present.
      let subAccounts: Model.SubAccount[] = newState.children.data;
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

export const createSubAccountReducer = (
  mapping: AccountSubAccountReducerFactoryActionMap,
  initialState: Modules.Budget.SubAccountStore
): Reducer<Modules.Budget.SubAccountStore, Redux.Action<any>> => {
  const genericReducer: Reducer<Modules.Budget.SubAccountStore, Redux.Action<any>> = combineReducers({
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
    children: createModelListResponseReducer<Model.SubAccount>({
      Response: mapping.SubAccounts.Response,
      Request: mapping.SubAccounts.Request,
      Loading: mapping.SubAccounts.Loading,
      SetSearch: mapping.SubAccounts.SetSearch,
      AddToState: mapping.SubAccounts.AddToState,
      Deleting: mapping.SubAccounts.Deleting,
      Updating: mapping.SubAccounts.Updating,
      Creating: mapping.SubAccounts.Creating
    }),
    groups: createModelListResponseReducer<Model.Group>({
      Response: mapping.Groups.Response,
      Loading: mapping.Groups.Loading,
      Request: mapping.Groups.Request,
      UpdateInState: mapping.Groups.UpdateInState,
      AddToState: mapping.Groups.AddToState,
      Deleting: mapping.Groups.Deleting
    }),
    comments: !isNil(mapping.Comments)
      ? createCommentsListResponseReducer(mapping.Comments)
      : identityReducer<Redux.ModelListResponseStore<Model.Comment>>(initialModelListResponseState),
    history: !isNil(mapping.History)
      ? createModelListResponseReducer<Model.HistoryEvent>(mapping.History)
      : identityReducer<Redux.ModelListResponseStore<Model.HistoryEvent>>(initialModelListResponseState)
  });

  return (state: Modules.Budget.SubAccountStore = initialState, action: Redux.Action<any>) => {
    let newState: Modules.Budget.SubAccountStore = genericReducer(state, action);

    if (action.type === mapping.Groups.UpdateInState) {
      const group: Model.Group = action.payload;
      newState = recalculateGroupMetrics<Modules.Budget.SubAccountStore>(action, newState, group.id);
    } else if (action.type === mapping.Groups.RemoveFromState) {
      newState = removeGroupFromState<Modules.Budget.SubAccountStore>(action, newState, action.payload);
    } else if (action.type === mapping.SubAccounts.RemoveFromGroup) {
      newState = removeModelFromGroup<Modules.Budget.SubAccountStore>(action, newState, action.payload);
    } else if (action.type === mapping.SubAccounts.AddToGroup) {
      newState = addModelToGroup<Modules.Budget.SubAccountStore>(
        action,
        newState,
        action.payload.id,
        action.payload.group
      );
    }
    // When a SubAccount's underlying subaccounts are removed, updated or added,
    // or the Fringes are changed, we need to update/recalculate the SubAccount.
    else if (action.type === mapping.TableChanged || action.type === mapping.Fringes.TableChanged) {
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
                newState.children.data,
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
            newState = updateSubAccountInState<Modules.Budget.SubAccountStore>(
              action,
              newState,
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
            newState = removeModelFromState<Modules.Budget.SubAccountStore>(action, newState, ids[i]);
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
              filter(newState.children.data, (subaccount: Model.SubAccount) => includes(subaccount.fringes, id)),
              (subaccount: Model.SubAccount) => {
                // NOTE: We have to recalculate the SubAccount metrics, instead of just refringing
                // the value, because the current estimated value on the SubAccount already has fringes
                // applied, and there is no way to refringe an already fringed value if we do not know
                // what the previous fringes were.
                newState = recalculateSubAccountMetrics<Modules.Budget.SubAccountStore>(action, newState, subaccount);
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
              filter(newState.children.data, (subaccount: Model.SubAccount) => includes(subaccount.fringes, id)),
              (subaccount: Model.SubAccount) => {
                newState = recalculateSubAccountMetrics<Modules.Budget.SubAccountStore>(action, newState, subaccount);
              }
            );
          });
        }
      }
      // Update the overall Account based on the underlying SubAccount(s) present.
      let subAccounts: Model.SubAccount[] = newState.children.data;
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

import { Reducer } from "redux";
import { isNil, find, includes, filter, map, reduce, forEach } from "lodash";
import { createListResponseReducer, createTablePlaceholdersReducer } from "lib/redux/factories";
import { AccountRowManager } from "lib/tabling/managers";
import { replaceInArray } from "lib/util";
import { warnInconsistentState } from "lib/redux/util";
import { initialListResponseState } from "store/initialState";

import { ActionType } from "../actions";
import { initialAccountsState } from "../initialState";

const listResponseReducer = createListResponseReducer<Model.Account, Redux.Budget.AccountsStore>(
  {
    Response: ActionType.Budget.Accounts.Response,
    Request: ActionType.Budget.Accounts.Request,
    Loading: ActionType.Budget.Accounts.Loading,
    SetSearch: ActionType.Budget.Accounts.SetSearch,
    UpdateInState: ActionType.Budget.Accounts.UpdateInState,
    RemoveFromState: ActionType.Budget.Accounts.RemoveFromState,
    AddToState: ActionType.Budget.Accounts.AddToState,
    Select: ActionType.Budget.Accounts.Select,
    Deselect: ActionType.Budget.Accounts.Deselect,
    SelectAll: ActionType.Budget.Accounts.SelectAll,
    Deleting: ActionType.Budget.Accounts.Deleting,
    Updating: ActionType.Budget.Accounts.Updating,
    Creating: ActionType.Budget.Accounts.Creating
  },
  {
    initialState: initialAccountsState,
    strictSelect: false,
    subReducers: {
      placeholders: createTablePlaceholdersReducer(
        {
          AddToState: ActionType.Budget.Accounts.Placeholders.AddToState,
          RemoveFromState: ActionType.Budget.Accounts.Placeholders.RemoveFromState,
          UpdateInState: ActionType.Budget.Accounts.Placeholders.UpdateInState,
          Clear: ActionType.Budget.Accounts.Request
        },
        AccountRowManager
      ),
      groups: createListResponseReducer<
        Model.Group<Model.SimpleAccount>,
        Redux.ListResponseStore<Model.Group<Model.SimpleAccount>>
      >(
        {
          Response: ActionType.Budget.Accounts.Groups.Response,
          Request: ActionType.Budget.Accounts.Groups.Request,
          Loading: ActionType.Budget.Accounts.Groups.Loading,
          RemoveFromState: ActionType.Budget.Accounts.Groups.RemoveFromState,
          AddToState: ActionType.Budget.Accounts.Groups.AddToState,
          Deleting: ActionType.Budget.Accounts.Groups.Deleting
        },
        {
          extensions: {
            [ActionType.Budget.Accounts.RemoveFromGroup]: (
              st: Redux.ListResponseStore<Model.Group<Model.SimpleAccount>> = initialListResponseState,
              action: Redux.Action<number>
            ) => {
              const group: Model.Group<Model.SimpleAccount> | undefined = find(
                st.data,
                (g: Model.Group<Model.SimpleAccount>) =>
                  includes(
                    map(g.children, (child: Model.SimpleAccount) => child.id),
                    action.payload
                  )
              );
              if (isNil(group)) {
                warnInconsistentState({
                  action: action.type,
                  reason: "Instance does not exist in a group state when it is expected to.",
                  entity: "account"
                });
                return st;
              } else {
                return {
                  ...st,
                  data: replaceInArray<Model.Group<Model.SimpleAccount>>(
                    st.data,
                    { id: group.id },
                    {
                      ...group,
                      children: filter(group.children, (child: Model.SimpleAccount) => child.id !== action.payload)
                    }
                  )
                };
              }
            }
          }
        }
      ),
      history: createListResponseReducer<Model.HistoryEvent>({
        Response: ActionType.Budget.Accounts.History.Response,
        Request: ActionType.Budget.Accounts.History.Request,
        Loading: ActionType.Budget.Accounts.History.Loading
      })
    }
  }
);

const recalculateGroupMetrics = (st: Redux.Budget.AccountsStore, groupId: number): Redux.Budget.AccountsStore => {
  // This might not be totally necessary, but it is good practice to not use the entire payload
  // to update the group (since that is already done by the reducer above) but to instead just
  // update the parts of the relevant parts of the current group in state (estimated, variance,
  // actual).
  const group = find(st.groups.data, { id: groupId });
  if (isNil(group)) {
    throw new Error(`The group with ID ${groupId} no longer exists in state!`);
  }
  const childrenIds = map(group.children, (child: Model.SimpleAccount) => child.id);
  const subAccounts = filter(
    map(childrenIds, (id: number) => {
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
    (child: Model.Account | null) => child !== null
  ) as Model.Account[];
  const actual = reduce(subAccounts, (sum: number, s: Model.Account) => sum + (s.actual || 0), 0);
  const estimated = reduce(subAccounts, (sum: number, s: Model.Account) => sum + (s.estimated || 0), 0);
  return {
    ...st,
    groups: {
      ...st.groups,
      data: replaceInArray<Model.Group<Model.SimpleAccount>>(
        st.groups.data,
        { id: group.id },
        { ...group, ...{ estimated, actual, variance: estimated - actual } }
      )
    }
  };
};

const rootReducer: Reducer<Redux.Budget.AccountsStore, Redux.Action<any>> = (
  state: Redux.Budget.AccountsStore = initialAccountsState,
  action: Redux.Action<any>
): Redux.Budget.AccountsStore => {
  let newState = { ...state };

  newState = listResponseReducer(newState, action);

  // NOTE: The above ListResponseReducer handles updates to the Group itself or the SubAccount itself
  // via these same actions. However, it does not do any recalculation of the group values, because
  // it needs the state of the Group and the state of the SubAccount(s) to do so. This means moving
  // that logic/recalculation further up the reducer tree where we have access to the SubAccount(s)
  // in state.
  if (action.type === ActionType.Budget.Accounts.Groups.UpdateInState) {
    const group: Model.Group<Model.SimpleAccount> = action.payload;
    newState = recalculateGroupMetrics(newState, group.id);
  } else if (action.type === ActionType.Budget.Accounts.Groups.AddToState) {
    const group: Model.Group<Model.SimpleAccount> = action.payload;
    forEach(group.children, (simpleAccount: Model.SimpleAccount) => {
      const account = find(newState.data, { id: simpleAccount.id });
      if (isNil(account)) {
        warnInconsistentState({
          action: action.type,
          reason: "Account does not exist in state for group child.",
          id: simpleAccount.id,
          groupId: group.id
        });
      } else {
        newState = {
          ...newState,
          data: replaceInArray<Model.Account>(newState.data, { id: simpleAccount.id }, { ...account, group: group.id })
        };
      }
    });
  } else if (action.type === ActionType.Budget.Accounts.Groups.RemoveFromState) {
    // NOTE: Here, we cannot look at the group that was removed from state because the action
    // only includes the group ID and the group was already removed from state.  Instead, we will
    // clear the group for any Account that belongs to a group no longer in state.
    forEach(newState.data, (account: Model.Account) => {
      if (!isNil(account.group)) {
        const group: Model.Group<Model.SimpleAccount> | undefined = find(newState.groups.data, { id: account.group });
        if (isNil(group)) {
          newState = {
            ...newState,
            data: replaceInArray<Model.Account>(newState.data, { id: account.id }, { ...account, group: null })
          };
        }
      }
    });
  } else if (action.type === ActionType.Budget.Accounts.UpdateInState) {
    const subAccount: Model.Account = action.payload;
    if (!isNil(subAccount.group)) {
      newState = recalculateGroupMetrics(newState, subAccount.group);
    }
  } else if (
    action.type === ActionType.Budget.Accounts.RemoveFromGroup ||
    action.type === ActionType.Budget.Accounts.RemoveFromState
  ) {
    const group: Model.Group<Model.SimpleAccount> | undefined = find(
      newState.groups.data,
      (g: Model.Group<Model.SimpleAccount>) =>
        includes(
          map(g.children, (child: Model.SimpleAccount) => child.id),
          action.payload
        )
    );
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
          data: replaceInArray<Model.Group<Model.SimpleAccount>>(
            newState.groups.data,
            { id: group.id },
            { ...group, children: filter(group.children, (child: Model.SimpleAccount) => child.id !== action.payload) }
          )
        }
      };
      newState = recalculateGroupMetrics(newState, group.id);
    }
  } else if (action.type === ActionType.Budget.Accounts.Placeholders.Activate) {
    // TODO: Do we need to recalculate group metrics here?
    const payload: Table.ActivatePlaceholderPayload<Model.Account> = action.payload;
    newState = {
      ...newState,
      placeholders: filter(
        newState.placeholders,
        (placeholder: Table.AccountRow) => placeholder.id !== action.payload.id
      ),
      data: [...newState.data, payload.model]
    };
  }
  return { ...newState };
};

export default rootReducer;

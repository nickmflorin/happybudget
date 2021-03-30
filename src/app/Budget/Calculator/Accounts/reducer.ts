import { combineReducers, Reducer } from "redux";
import { isNil, find, includes, filter, map, reduce } from "lodash";
import {
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createCommentsListResponseReducer,
  createListResponseReducer,
  createTablePlaceholdersReducer
} from "store/factories";
import { AccountMapping } from "model/tableMappings";
import { replaceInArray } from "util/arrays";

import { initialAccountsState } from "../initialState";
import { ActionType } from "./actions";

export const createAccountsReducer = (): Reducer<Redux.Calculator.IAccountsStore, Redux.IAction<any>> => {
  const listResponseReducer = createListResponseReducer<IAccount, Redux.Calculator.IAccountsStore>(
    {
      Response: ActionType.Accounts.Response,
      Request: ActionType.Accounts.Request,
      Loading: ActionType.Accounts.Loading,
      SetSearch: ActionType.Accounts.SetSearch,
      UpdateInState: ActionType.Accounts.UpdateInState,
      RemoveFromState: ActionType.Accounts.RemoveFromState,
      AddToState: ActionType.Accounts.AddToState,
      Select: ActionType.Accounts.Select,
      Deselect: ActionType.Accounts.Deselect,
      SelectAll: ActionType.Accounts.SelectAll
    },
    {
      referenceEntity: "account",
      initialState: initialAccountsState,
      strictSelect: false,
      keyReducers: {
        placeholders: createTablePlaceholdersReducer(
          {
            AddToState: ActionType.Accounts.Placeholders.AddToState,
            Activate: ActionType.Accounts.Placeholders.Activate,
            RemoveFromState: ActionType.Accounts.Placeholders.RemoveFromState,
            UpdateInState: ActionType.Accounts.Placeholders.UpdateInState,
            Clear: ActionType.Accounts.Request
          },
          AccountMapping,
          { referenceEntity: "account" }
        ),
        groups: createListResponseReducer<IGroup<ISimpleAccount>, Redux.Calculator.IGroupsStore<ISimpleAccount>>(
          {
            Response: ActionType.Accounts.Groups.Response,
            Request: ActionType.Accounts.Groups.Request,
            Loading: ActionType.Accounts.Groups.Loading,
            RemoveFromState: ActionType.Accounts.Groups.RemoveFromState,
            AddToState: ActionType.Accounts.Groups.AddToState
          },
          {
            referenceEntity: "group",
            keyReducers: {
              deleting: createModelListActionReducer(ActionType.Accounts.Groups.Deleting, {
                referenceEntity: "group"
              })
            },
            extensions: {
              [ActionType.Accounts.RemoveFromGroup]: (
                id: number,
                st: Redux.Calculator.IGroupsStore<ISimpleAccount>
              ) => {
                const group: IGroup<ISimpleAccount> | undefined = find(st.data, (g: IGroup<ISimpleAccount>) =>
                  includes(
                    map(g.children, (child: ISimpleAccount) => child.id),
                    id
                  )
                );
                if (isNil(group)) {
                  /* eslint-disable no-console */
                  console.error(
                    `Inconsistent State!:  Inconsistent state noticed when removing account from group...
                    the account with ID ${id} does not exist in a group in state when it is expected to.`
                  );
                  return {};
                } else {
                  return {
                    data: replaceInArray<IGroup<ISimpleAccount>>(
                      st.data,
                      { id: group.id },
                      { ...group, children: filter(group.children, (child: ISimpleAccount) => child.id !== id) }
                    )
                  };
                }
              }
            }
          }
        ),
        deleting: createModelListActionReducer(ActionType.Accounts.Deleting, {
          referenceEntity: "account"
        }),
        updating: createModelListActionReducer(ActionType.Accounts.Updating, {
          referenceEntity: "account"
        }),
        history: createListResponseReducer<HistoryEvent>(
          {
            Response: ActionType.Accounts.History.Response,
            Request: ActionType.Accounts.History.Request,
            Loading: ActionType.Accounts.History.Loading
          },
          { referenceEntity: "event" }
        ),
        creating: createSimpleBooleanReducer(ActionType.Accounts.Creating)
      }
    }
  );

  const recalculateGroupMetrics = (
    st: Redux.Calculator.IAccountsStore,
    groupId: number
  ): Redux.Calculator.IAccountsStore => {
    // This might not be totally necessary, but it is good practice to not use the entire payload
    // to update the group (since that is already done by the reducer above) but to instead just
    // update the parts of the relevant parts of the current group in state (estimated, variance,
    // actual).
    const group = find(st.groups.data, { id: groupId });
    if (isNil(group)) {
      throw new Error(`The group with ID ${groupId} no longer exists in state!`);
    }
    const childrenIds = map(group.children, (child: ISimpleAccount) => child.id);
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
      (child: IAccount | null) => child !== null
    ) as IAccount[];
    const actual = reduce(subAccounts, (sum: number, s: IAccount) => sum + (s.actual || 0), 0);
    const estimated = reduce(subAccounts, (sum: number, s: IAccount) => sum + (s.estimated || 0), 0);
    return {
      ...st,
      groups: {
        ...st.groups,
        data: replaceInArray<IGroup<ISimpleAccount>>(
          st.groups.data,
          { id: group.id },
          { ...group, ...{ estimated, actual, variance: estimated - actual } }
        )
      }
    };
  };

  return (
    state: Redux.Calculator.IAccountsStore = initialAccountsState,
    action: Redux.IAction<any>
  ): Redux.Calculator.IAccountsStore => {
    let newState = { ...state };

    newState = listResponseReducer(newState, action);

    // NOTE: The above ListResponseReducer handles updates to the Group itself or the SubAccount itself
    // via these same actions. However, it does not do any recalculation of the group values, because
    // it needs the state of the Group and the state of the SubAccount(s) to do so. This means moving
    // that logic/recalculation further up the reducer tree where we have access to the SubAccount(s)
    // in state.
    if (action.type === ActionType.Accounts.Groups.UpdateInState) {
      const group: IGroup<ISimpleAccount> = action.payload;
      newState = recalculateGroupMetrics(newState, group.id);
    } else if (action.type === ActionType.Accounts.UpdateInState) {
      const subAccount: IAccount = action.payload;
      if (!isNil(subAccount.group)) {
        newState = recalculateGroupMetrics(newState, subAccount.group);
      }
    } else if (
      action.type === ActionType.Accounts.RemoveFromGroup ||
      action.type === ActionType.Accounts.RemoveFromState
    ) {
      const group: IGroup<ISimpleAccount> | undefined = find(newState.groups.data, (g: IGroup<ISimpleAccount>) =>
        includes(
          map(g.children, (child: ISimpleAccount) => child.id),
          action.payload
        )
      );
      if (isNil(group)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!  Inconsistent state noticed when removing account from group.
        A group does not exist for account ${action.payload}.`
        );
      } else {
        newState = {
          ...newState,
          groups: {
            ...newState.groups,
            data: replaceInArray<IGroup<ISimpleAccount>>(
              newState.groups.data,
              { id: group.id },
              { ...group, children: filter(group.children, (child: ISimpleAccount) => child.id !== action.payload) }
            )
          }
        };
        newState = recalculateGroupMetrics(newState, group.id);
      }
    }

    return { ...newState };
  };
};

const rootReducer: Reducer<Redux.Calculator.IBudgetStore, Redux.IAction<any>> = combineReducers({
  comments: createCommentsListResponseReducer({
    Response: ActionType.Comments.Response,
    Request: ActionType.Comments.Request,
    Loading: ActionType.Comments.Loading,
    AddToState: ActionType.Comments.AddToState,
    RemoveFromState: ActionType.Comments.RemoveFromState,
    UpdateInState: ActionType.Comments.UpdateInState,
    Submitting: ActionType.Comments.Submitting,
    Deleting: ActionType.Comments.Deleting,
    Editing: ActionType.Comments.Editing,
    Replying: ActionType.Comments.Replying
  }),
  accounts: createAccountsReducer()
});

export default rootReducer;

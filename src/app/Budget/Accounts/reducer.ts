import { Reducer } from "redux";
import { isNil, find, includes, filter, map, reduce } from "lodash";
import { createSimpleBooleanReducer, createModelListActionReducer, createListResponseReducer } from "store/factories";
import { AccountMapping } from "model/tableMappings";
import { replaceInArray } from "util/arrays";

import { ActionType } from "../actions";
import { initialAccountsState } from "../initialState";
import { createTablePlaceholdersReducer } from "../factories";

const listResponseReducer = createListResponseReducer<IAccount, Redux.Budget.IAccountsStore>(
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
    SelectAll: ActionType.Budget.Accounts.SelectAll
  },
  {
    referenceEntity: "account",
    initialState: initialAccountsState,
    strictSelect: false,
    keyReducers: {
      placeholders: createTablePlaceholdersReducer(
        {
          AddToState: ActionType.Budget.Accounts.Placeholders.AddToState,
          RemoveFromState: ActionType.Budget.Accounts.Placeholders.RemoveFromState,
          UpdateInState: ActionType.Budget.Accounts.Placeholders.UpdateInState,
          Clear: ActionType.Budget.Accounts.Request
        },
        AccountMapping,
        { referenceEntity: "account" }
      ),
      groups: createListResponseReducer<IGroup<ISimpleAccount>, Redux.Budget.IGroupsStore<ISimpleAccount>>(
        {
          Response: ActionType.Budget.Accounts.Groups.Response,
          Request: ActionType.Budget.Accounts.Groups.Request,
          Loading: ActionType.Budget.Accounts.Groups.Loading,
          RemoveFromState: ActionType.Budget.Accounts.Groups.RemoveFromState,
          AddToState: ActionType.Budget.Accounts.Groups.AddToState
        },
        {
          referenceEntity: "group",
          keyReducers: {
            deleting: createModelListActionReducer(ActionType.Budget.Accounts.Groups.Deleting, {
              referenceEntity: "group"
            })
          },
          extensions: {
            [ActionType.Budget.Accounts.RemoveFromGroup]: (
              id: number,
              st: Redux.Budget.IGroupsStore<ISimpleAccount>
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
      deleting: createModelListActionReducer(ActionType.Budget.Accounts.Deleting, {
        referenceEntity: "account"
      }),
      updating: createModelListActionReducer(ActionType.Budget.Accounts.Updating, {
        referenceEntity: "account"
      }),
      history: createListResponseReducer<HistoryEvent>(
        {
          Response: ActionType.Budget.Accounts.History.Response,
          Request: ActionType.Budget.Accounts.History.Request,
          Loading: ActionType.Budget.Accounts.History.Loading
        },
        { referenceEntity: "event" }
      ),
      creating: createSimpleBooleanReducer(ActionType.Budget.Accounts.Creating)
    }
  }
);

const recalculateGroupMetrics = (st: Redux.Budget.IAccountsStore, groupId: number): Redux.Budget.IAccountsStore => {
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

const rootReducer: Reducer<Redux.Budget.IAccountsStore, Redux.IAction<any>> = (
  state: Redux.Budget.IAccountsStore = initialAccountsState,
  action: Redux.IAction<any>
): Redux.Budget.IAccountsStore => {
  let newState = { ...state };

  newState = listResponseReducer(newState, action);

  // NOTE: The above ListResponseReducer handles updates to the Group itself or the SubAccount itself
  // via these same actions. However, it does not do any recalculation of the group values, because
  // it needs the state of the Group and the state of the SubAccount(s) to do so. This means moving
  // that logic/recalculation further up the reducer tree where we have access to the SubAccount(s)
  // in state.
  if (action.type === ActionType.Budget.Accounts.Groups.UpdateInState) {
    const group: IGroup<ISimpleAccount> = action.payload;
    newState = recalculateGroupMetrics(newState, group.id);
  } else if (action.type === ActionType.Budget.Accounts.UpdateInState) {
    const subAccount: IAccount = action.payload;
    if (!isNil(subAccount.group)) {
      newState = recalculateGroupMetrics(newState, subAccount.group);
    }
  } else if (
    action.type === ActionType.Budget.Accounts.RemoveFromGroup ||
    action.type === ActionType.Budget.Accounts.RemoveFromState
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
  } else if (action.type === ActionType.Budget.Accounts.Placeholders.Activate) {
    // TODO: Do we need to recalculate group metrics here?
    const payload: Table.ActivatePlaceholderPayload<IAccount> = action.payload;
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

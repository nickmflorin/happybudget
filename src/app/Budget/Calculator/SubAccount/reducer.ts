import { combineReducers, Reducer } from "redux";
import { isNil, find, includes, map, filter, reduce } from "lodash";
import {
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer,
  createListResponseReducer,
  createTablePlaceholdersReducer
} from "store/factories";
import { SubAccountMapping } from "model/tableMappings";
import { replaceInArray } from "util/arrays";

import { ActionType } from "./actions";
import { initialSubAccountsState } from "./initialState";

export const createSubAccountsReducer = (): Reducer<
  Redux.Calculator.ISubAccountsStore<Table.SubAccountRow>,
  Redux.IAction<any>
> => {
  const listResponseReducer = createListResponseReducer<
    ISubAccount,
    Redux.Calculator.ISubAccountsStore<Table.SubAccountRow>
  >(
    {
      Response: ActionType.SubAccounts.Response,
      Request: ActionType.SubAccounts.Request,
      Loading: ActionType.SubAccounts.Loading,
      SetSearch: ActionType.SubAccounts.SetSearch,
      UpdateInState: ActionType.SubAccounts.UpdateInState,
      RemoveFromState: ActionType.SubAccounts.RemoveFromState,
      AddToState: ActionType.SubAccounts.AddToState,
      Select: ActionType.SubAccounts.Select,
      Deselect: ActionType.SubAccounts.Deselect,
      SelectAll: ActionType.SubAccounts.SelectAll
    },
    {
      referenceEntity: "subaccount",
      strictSelect: false,
      keyReducers: {
        placeholders: createTablePlaceholdersReducer(
          {
            AddToState: ActionType.SubAccounts.Placeholders.AddToState,
            Activate: ActionType.SubAccounts.Placeholders.Activate,
            RemoveFromState: ActionType.SubAccounts.Placeholders.RemoveFromState,
            UpdateInState: ActionType.SubAccounts.Placeholders.UpdateInState
          },
          SubAccountMapping,
          { referenceEntity: "subaccount" }
        ),
        groups: createListResponseReducer<IGroup<ISimpleSubAccount>, Redux.Calculator.IGroupsStore<ISimpleSubAccount>>(
          {
            Response: ActionType.SubAccounts.Groups.Response,
            Request: ActionType.SubAccounts.Groups.Request,
            Loading: ActionType.SubAccounts.Groups.Loading,
            RemoveFromState: ActionType.SubAccounts.Groups.RemoveFromState,
            AddToState: ActionType.SubAccounts.Groups.AddToState
          },
          {
            referenceEntity: "group",
            keyReducers: {
              deleting: createModelListActionReducer(ActionType.SubAccounts.Groups.Deleting, {
                referenceEntity: "group"
              })
            }
          }
        ),
        deleting: createModelListActionReducer(ActionType.SubAccounts.Deleting, {
          referenceEntity: "subaccount"
        }),
        updating: createModelListActionReducer(ActionType.SubAccounts.Updating, {
          referenceEntity: "subaccount"
        }),
        history: createListResponseReducer<HistoryEvent>(
          {
            Response: ActionType.SubAccounts.History.Response,
            Request: ActionType.SubAccounts.History.Request,
            Loading: ActionType.SubAccounts.History.Loading
          },
          { referenceEntity: "event" }
        ),
        creating: createSimpleBooleanReducer(ActionType.SubAccounts.Creating)
      }
    }
  );

  return (
    state: Redux.Calculator.ISubAccountsStore<Table.SubAccountRow> = initialSubAccountsState,
    action: Redux.IAction<any>
  ): Redux.Calculator.ISubAccountsStore<Table.SubAccountRow> => {
    const recalculateGroupMetrics = (
      st: Redux.Calculator.ISubAccountsStore<Table.SubAccountRow>,
      groupId: number
    ): Redux.Calculator.ISubAccountsStore<Table.SubAccountRow> => {
      // This might not be totally necessary, but it is good practice to not use the entire payload
      // to update the group (since that is already done by the reducer above) but to instead just
      // update the parts of the relevant parts of the current group in state (estimated, variance,
      // actual).
      const group = find(st.groups.data, { id: groupId });
      if (isNil(group)) {
        throw new Error(`The group with ID ${groupId} no longer exists in state!`);
      }
      const childrenIds = map(group.children, (child: ISimpleSubAccount) => child.id);
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
        (child: ISubAccount | null) => child !== null
      ) as ISubAccount[];
      const actual = reduce(subAccounts, (sum: number, s: ISubAccount) => sum + (s.actual || 0), 0);
      const estimated = reduce(subAccounts, (sum: number, s: ISubAccount) => sum + (s.estimated || 0), 0);
      return {
        ...st,
        groups: {
          ...st.groups,
          data: replaceInArray<IGroup<ISimpleSubAccount>>(
            st.groups.data,
            { id: group.id },
            { ...group, ...{ estimated, actual, variance: estimated - actual } }
          )
        }
      };
    };

    let newState = { ...state };

    newState = listResponseReducer(newState, action);

    // NOTE: The above ListResponseReducer handles updates to the Group itself or the SubAccount itself
    // via these same actions. However, it does not do any recalculation of the group values, because
    // it needs the state of the Group and the state of the SubAccount(s) to do so. This means moving
    // that logic/recalculation further up the reducer tree where we have access to the SubAccount(s)
    // in state.
    if (action.type === ActionType.SubAccounts.Groups.UpdateInState) {
      const group: IGroup<ISimpleSubAccount> = action.payload;
      newState = recalculateGroupMetrics(newState, group.id);
    } else if (action.type === ActionType.SubAccounts.UpdateInState) {
      const subAccount: ISubAccount = action.payload;
      if (!isNil(subAccount.group)) {
        newState = recalculateGroupMetrics(newState, subAccount.group);
      }
    } else if (action.type === ActionType.SubAccounts.RemoveFromGroup) {
      const group: IGroup<ISimpleSubAccount> | undefined = find(newState.groups.data, (g: IGroup<ISimpleSubAccount>) =>
        includes(
          map(g.children, (child: ISimpleSubAccount) => child.id),
          action.payload
        )
      );
      if (isNil(group)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!  Inconsistent state noticed when removing sub account from group.
          A group does not exist for sub account ${action.payload}.`
        );
      } else {
        newState = {
          ...newState,
          groups: {
            ...newState.groups,
            data: replaceInArray<IGroup<ISimpleSubAccount>>(
              newState.groups.data,
              { id: group.id },
              { ...group, children: filter(group.children, (child: ISimpleSubAccount) => child.id !== action.payload) }
            )
          }
        };
        newState = recalculateGroupMetrics(newState, group.id);
      }
    }

    return { ...newState };
  };
};

const rootReducer = combineReducers({
  id: createSimplePayloadReducer(ActionType.SubAccount.SetId),
  detail: createDetailResponseReducer<ISubAccount, Redux.IDetailResponseStore<ISubAccount>, Redux.IAction>({
    Response: ActionType.SubAccount.Response,
    Loading: ActionType.SubAccount.Loading,
    Request: ActionType.SubAccount.Request
  }),
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
  subaccounts: createSubAccountsReducer()
});

export default rootReducer;

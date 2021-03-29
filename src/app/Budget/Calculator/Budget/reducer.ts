import { combineReducers } from "redux";
import { isNil, find, includes, filter, map } from "lodash";
import {
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createCommentsListResponseReducer,
  createListResponseReducer,
  createTablePlaceholdersReducer
} from "store/factories";
import { AccountMapping } from "model/tableMappings";
import { replaceInArray } from "util/arrays";

import { ActionType } from "./actions";
import { initialAccountsState } from "./initialState";

const rootReducer = combineReducers({
  deleting: createModelListActionReducer(ActionType.Accounts.Deleting, { referenceEntity: "account" }),
  updating: createModelListActionReducer(ActionType.Accounts.Updating, { referenceEntity: "account" }),
  creating: createSimpleBooleanReducer(ActionType.Accounts.Creating),
  history: createListResponseReducer<HistoryEvent>(
    {
      Response: ActionType.Accounts.History.Response,
      Request: ActionType.Accounts.History.Request,
      Loading: ActionType.Accounts.History.Loading,
      AddToState: ActionType.Accounts.History.AddToState
    },
    { referenceEntity: "event" }
  ),
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
  accounts: createListResponseReducer<IAccount, Redux.Calculator.IAccountsStore>(
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
            UpdateInState: ActionType.Accounts.Placeholders.UpdateInState
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
  )
});

export default rootReducer;

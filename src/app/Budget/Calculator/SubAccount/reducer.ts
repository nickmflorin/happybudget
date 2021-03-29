import { combineReducers } from "redux";
import { isNil, find, includes, map, filter } from "lodash";
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
  subaccounts: createListResponseReducer<ISubAccount, Redux.Calculator.ISubAccountsStore<Table.SubAccountRow>>(
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
            },
            extensions: {
              [ActionType.SubAccounts.RemoveFromGroup]: (
                id: number,
                st: Redux.Calculator.IGroupsStore<ISimpleSubAccount>
              ) => {
                const group: IGroup<ISimpleSubAccount> | undefined = find(st.data, (g: IGroup<ISimpleSubAccount>) =>
                  includes(
                    map(g.children, (child: ISimpleSubAccount) => child.id),
                    id
                  )
                );
                if (isNil(group)) {
                  /* eslint-disable no-console */
                  console.error(
                    `Inconsistent State!:  Inconsistent state noticed when removing sub account from group...
                    the subaccount with ID ${id} does not exist in a group in state when it is expected to.`
                  );
                  return {};
                } else {
                  return {
                    data: replaceInArray<IGroup<ISimpleSubAccount>>(
                      st.data,
                      { id: group.id },
                      { ...group, children: filter(group.children, (child: ISimpleSubAccount) => child.id !== id) }
                    )
                  };
                }
              }
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
  )
});

export default rootReducer;

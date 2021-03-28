import { combineReducers } from "redux";
import { isNil, find } from "lodash";
import {
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createCommentsListResponseReducer,
  createListResponseReducer,
  createTablePlaceholdersReducer
} from "store/factories";
import { groupToNestedGroup } from "model/mappings";
import { SubAccountMapping } from "model/tableMappings";
import { replaceInArray } from "util/arrays";
import { ActionType } from "./actions";

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
      referenceEntity: "subaccount",
      keyReducers: {
        placeholders: createTablePlaceholdersReducer(
          {
            AddToState: ActionType.Accounts.Placeholders.AddToState,
            Activate: ActionType.Accounts.Placeholders.Activate,
            RemoveFromState: ActionType.Accounts.Placeholders.RemoveFromState,
            UpdateInState: ActionType.Accounts.Placeholders.UpdateInState
          },
          SubAccountMapping,
          { referenceEntity: "subaccount" }
        ),
        groups: combineReducers({
          deleting: createModelListActionReducer(ActionType.Accounts.Groups.Deleting, {
            referenceEntity: "group"
          })
        }),
        deleting: createModelListActionReducer(ActionType.Accounts.Deleting, {
          referenceEntity: "subaccount"
        }),
        updating: createModelListActionReducer(ActionType.Accounts.Updating, {
          referenceEntity: "subaccount"
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
      },
      extensions: {
        [ActionType.Accounts.Groups.AddToState]: (
          group: IGroup<ISimpleAccount>,
          st: Redux.Calculator.IAccountsStore
        ) => {
          let data = [...st.data];
          for (let i = 0; i < group.children.length; i++) {
            const child: ISimpleAccount = group.children[i];
            const model = find(data, { id: child.id });
            if (isNil(model)) {
              /* eslint-disable no-console */
              console.error(
                `Inconsistent State!: Inconsistent state noticed when adding group to state.
                Group has child ${child.id} that does not exist in state when it is expected to.`
              );
            } else {
              data = replaceInArray<IAccount>(data, { id: child.id }, { ...model, group: groupToNestedGroup(group) });
            }
          }
          return { data };
        },
        [ActionType.Accounts.Groups.RemoveFromState]: (id: number, st: Redux.Calculator.IAccountsStore) => {
          let data = [...st.data];
          for (let i = 0; i < data.length; i++) {
            const model: IAccount = data[i];
            if (!isNil(model.group) && model.group.id === id) {
              data = replaceInArray<IAccount>(data, { id: model.id }, { ...model, group: null });
            }
          }
          return { data };
        },
        [ActionType.Accounts.Groups.UpdateInState]: (group: INestedGroup, st: Redux.Calculator.IAccountsStore) => {
          let data = [...st.data];
          for (let i = 0; i < data.length; i++) {
            const model: IAccount = data[i];
            if (!isNil(model.group) && model.group.id === group.id) {
              data = replaceInArray<IAccount>(data, { id: model.id }, { ...model, group });
            }
          }
          return { data };
        }
      }
    }
  )
});

export default rootReducer;

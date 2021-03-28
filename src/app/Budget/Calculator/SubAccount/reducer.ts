import { combineReducers } from "redux";
import { isNil, find } from "lodash";
import {
  createDetailResponseReducer,
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createSimplePayloadReducer,
  createCommentsListResponseReducer,
  createListResponseReducer,
  createTablePlaceholdersReducer
} from "store/factories";
import { groupToNestedGroup } from "model/mappings";
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
        groups: combineReducers({
          deleting: createModelListActionReducer(ActionType.SubAccounts.Groups.Deleting, {
            referenceEntity: "group"
          })
        }),
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
      },
      extensions: {
        [ActionType.SubAccounts.Groups.AddToState]: (
          group: IGroup<ISimpleSubAccount>,
          st: Redux.Calculator.ISubAccountsStore<Table.SubAccountRow>
        ) => {
          let data = [...st.data];
          for (let i = 0; i < group.children.length; i++) {
            const child: ISimpleSubAccount = group.children[i];
            const model = find(data, { id: child.id });
            if (isNil(model)) {
              /* eslint-disable no-console */
              console.error(
                `Inconsistent State!: Inconsistent state noticed when adding group to state.
                Group has child ${child.id} that does not exist in state when it is expected to.`
              );
            } else {
              data = replaceInArray<ISubAccount>(
                data,
                { id: child.id },
                { ...model, group: groupToNestedGroup(group) }
              );
            }
          }
          return { data };
        },
        [ActionType.SubAccounts.Groups.RemoveFromState]: (
          id: number,
          st: Redux.Calculator.ISubAccountsStore<Table.SubAccountRow>
        ) => {
          let data = [...st.data];
          for (let i = 0; i < data.length; i++) {
            const model: ISubAccount = data[i];
            if (!isNil(model.group) && model.group.id === id) {
              data = replaceInArray<ISubAccount>(data, { id: model.id }, { ...model, group: null });
            }
          }
          return { data };
        },
        [ActionType.SubAccounts.Groups.UpdateInState]: (
          group: INestedGroup,
          st: Redux.Calculator.ISubAccountsStore<Table.SubAccountRow>
        ) => {
          let data = [...st.data];
          for (let i = 0; i < data.length; i++) {
            const model: ISubAccount = data[i];
            if (!isNil(model.group) && model.group.id === group.id) {
              data = replaceInArray<ISubAccount>(data, { id: model.id }, { ...model, group });
            }
          }
          return { data };
        }
      }
    }
  )
});

export default rootReducer;

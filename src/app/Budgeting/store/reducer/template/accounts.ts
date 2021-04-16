import { Reducer } from "redux";
import { isNil, find, includes, filter, map, reduce, forEach } from "lodash";
import { createListResponseReducer, createTablePlaceholdersReducer } from "lib/redux/factories";
import { BudgetAccountRowManager } from "lib/tabling/managers";
import { replaceInArray } from "lib/util";
import { warnInconsistentState } from "lib/redux/util";
import { initialListResponseState } from "store/initialState";

import { ActionType } from "../../actions";
import { initialTemplateAccountsState } from "../../initialState";

const listResponseReducer = createListResponseReducer<Model.TemplateAccount, Redux.Template.AccountsStore>(
  {
    Response: ActionType.Template.Accounts.Response,
    Request: ActionType.Template.Accounts.Request,
    Loading: ActionType.Template.Accounts.Loading,
    SetSearch: ActionType.Template.Accounts.SetSearch,
    UpdateInState: ActionType.Template.Accounts.UpdateInState,
    RemoveFromState: ActionType.Template.Accounts.RemoveFromState,
    AddToState: ActionType.Template.Accounts.AddToState,
    Select: ActionType.Template.Accounts.Select,
    Deselect: ActionType.Template.Accounts.Deselect,
    SelectAll: ActionType.Template.Accounts.SelectAll,
    Deleting: ActionType.Template.Accounts.Deleting,
    Updating: ActionType.Template.Accounts.Updating,
    Creating: ActionType.Template.Accounts.Creating
  },
  {
    initialState: initialTemplateAccountsState,
    strictSelect: false,
    subReducers: {
      placeholders: createTablePlaceholdersReducer(
        {
          AddToState: ActionType.Template.Accounts.Placeholders.AddToState,
          RemoveFromState: ActionType.Template.Accounts.Placeholders.RemoveFromState,
          UpdateInState: ActionType.Template.Accounts.Placeholders.UpdateInState,
          Clear: ActionType.Template.Accounts.Request
        },
        BudgetAccountRowManager
      ),
      groups: createListResponseReducer<Model.TemplateGroup, Redux.ListResponseStore<Model.TemplateGroup>>(
        {
          Response: ActionType.Template.Accounts.Groups.Response,
          Request: ActionType.Template.Accounts.Groups.Request,
          Loading: ActionType.Template.Accounts.Groups.Loading,
          RemoveFromState: ActionType.Template.Accounts.Groups.RemoveFromState,
          AddToState: ActionType.Template.Accounts.Groups.AddToState,
          Deleting: ActionType.Template.Accounts.Groups.Deleting
        },
        {
          extensions: {
            [ActionType.Template.Accounts.RemoveFromGroup]: (
              st: Redux.ListResponseStore<Model.TemplateGroup> = initialListResponseState,
              action: Redux.Action<number>
            ) => {
              const group: Model.TemplateGroup | undefined = find(st.data, (g: Model.TemplateGroup) =>
                includes(g.children, action.payload)
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
                  data: replaceInArray<Model.TemplateGroup>(
                    st.data,
                    { id: group.id },
                    {
                      ...group,
                      children: filter(group.children, (child: number) => child !== action.payload)
                    }
                  )
                };
              }
            }
          }
        }
      )
    }
  }
);

const recalculateGroupMetrics = (st: Redux.Template.AccountsStore, groupId: number): Redux.Template.AccountsStore => {
  // This might not be totally necessary, but it is good practice to not use the entire payload
  // to update the group (since that is already done by the reducer above) but to instead just
  // update the parts of the relevant parts of the current group in state (estimated, variance,
  // actual).
  const group = find(st.groups.data, { id: groupId });
  if (isNil(group)) {
    throw new Error(`The group with ID ${groupId} no longer exists in state!`);
  }
  const subAccounts = filter(
    map(group.children, (id: number) => {
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
    (child: Model.TemplateAccount | null) => child !== null
  ) as Model.TemplateAccount[];
  const estimated = reduce(subAccounts, (sum: number, s: Model.TemplateAccount) => sum + (s.estimated || 0), 0);
  return {
    ...st,
    groups: {
      ...st.groups,
      data: replaceInArray<Model.TemplateGroup>(st.groups.data, { id: group.id }, { ...group, ...{ estimated } })
    }
  };
};

const rootReducer: Reducer<Redux.Template.AccountsStore, Redux.Action<any>> = (
  state: Redux.Template.AccountsStore = initialTemplateAccountsState,
  action: Redux.Action<any>
): Redux.Template.AccountsStore => {
  let newState = { ...state };

  newState = listResponseReducer(newState, action);

  // NOTE: The above ListResponseReducer handles updates to the Group itself or the SubAccount itself
  // via these same actions. However, it does not do any recalculation of the group values, because
  // it needs the state of the Group and the state of the SubAccount(s) to do so. This means moving
  // that logic/recalculation further up the reducer tree where we have access to the SubAccount(s)
  // in state.
  if (action.type === ActionType.Template.Accounts.Groups.UpdateInState) {
    const group: Model.TemplateGroup = action.payload;
    newState = recalculateGroupMetrics(newState, group.id);
  } else if (action.type === ActionType.Template.Accounts.Groups.AddToState) {
    const group: Model.TemplateGroup = action.payload;
    forEach(group.children, (simpleAccount: number) => {
      const account = find(newState.data, { id: simpleAccount });
      if (isNil(account)) {
        warnInconsistentState({
          action: action.type,
          reason: "Account does not exist in state for group child.",
          id: simpleAccount,
          groupId: group.id
        });
      } else {
        newState = {
          ...newState,
          data: replaceInArray<Model.TemplateAccount>(
            newState.data,
            { id: simpleAccount },
            { ...account, group: group.id }
          )
        };
      }
    });
  } else if (action.type === ActionType.Template.Accounts.Groups.RemoveFromState) {
    // NOTE: Here, we cannot look at the group that was removed from state because the action
    // only includes the group ID and the group was already removed from state.  Instead, we will
    // clear the group for any Account that belongs to a group no longer in state.
    forEach(newState.data, (account: Model.TemplateAccount) => {
      if (!isNil(account.group)) {
        const group: Model.TemplateGroup | undefined = find(newState.groups.data, { id: account.group });
        if (isNil(group)) {
          newState = {
            ...newState,
            data: replaceInArray<Model.TemplateAccount>(newState.data, { id: account.id }, { ...account, group: null })
          };
        }
      }
    });
  } else if (action.type === ActionType.Template.Accounts.UpdateInState) {
    const subAccount: Model.TemplateAccount = action.payload;
    if (!isNil(subAccount.group)) {
      newState = recalculateGroupMetrics(newState, subAccount.group);
    }
  } else if (
    action.type === ActionType.Template.Accounts.RemoveFromGroup ||
    action.type === ActionType.Template.Accounts.RemoveFromState
  ) {
    const group: Model.TemplateGroup | undefined = find(newState.groups.data, (g: Model.TemplateGroup) =>
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
          data: replaceInArray<Model.TemplateGroup>(
            newState.groups.data,
            { id: group.id },
            { ...group, children: filter(group.children, (child: number) => child !== action.payload) }
          )
        }
      };
      newState = recalculateGroupMetrics(newState, group.id);
    }
  } else if (action.type === ActionType.Template.Accounts.Placeholders.Activate) {
    // TODO: Do we need to recalculate group metrics here?
    const payload: Table.ActivatePlaceholderPayload<Model.TemplateAccount> = action.payload;
    newState = {
      ...newState,
      placeholders: filter(
        newState.placeholders,
        (placeholder: Table.TemplateAccountRow) => placeholder.id !== action.payload.id
      ),
      data: [...newState.data, payload.model]
    };
  }
  return { ...newState };
};

export default rootReducer;

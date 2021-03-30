import { Reducer } from "redux";
import { isNil, find, includes, map, filter, reduce } from "lodash";
import {
  createSimpleBooleanReducer,
  createModelListActionReducer,
  createListResponseReducer,
  createTablePlaceholdersReducer
} from "store/factories";
import { SubAccountMapping } from "model/tableMappings";
import { replaceInArray } from "util/arrays";
import { initialSubAccountsState } from "./initialState";

interface SubAccountsPlaceholdersActionMap {
  AddToState: string;
  Activate: string;
  RemoveFromState: string;
  UpdateInState: string;
}

interface SubAccountsGroupsActionMap {
  Response: string;
  Request: string;
  Loading: string;
  RemoveFromState: string;
  UpdateInState: string;
  AddToState: string;
  Deleting: string;
}

interface SubAccountsHistoryActionMap {
  Response: string;
  Request: string;
  Loading: string;
}

export interface SubAccountsReducerFactoryActionMap {
  Response: string;
  Request: string;
  Loading: string;
  SetSearch: string;
  UpdateInState: string;
  RemoveFromState: string;
  AddToState: string;
  Select: string;
  Deselect: string;
  SelectAll: string;
  RemoveFromGroup: string;
  Creating: string;
  Updating: string;
  Deleting: string;
  Placeholders: SubAccountsPlaceholdersActionMap;
  Groups: SubAccountsGroupsActionMap;
  History: SubAccountsHistoryActionMap;
}

export const createSubAccountsReducer = (
  mapping: SubAccountsReducerFactoryActionMap
): Reducer<Redux.Calculator.ISubAccountsStore, Redux.IAction<any>> => {
  const listResponseReducer = createListResponseReducer<ISubAccount, Redux.Calculator.ISubAccountsStore>(
    {
      Response: mapping.Response,
      Request: mapping.Request,
      Loading: mapping.Loading,
      SetSearch: mapping.SetSearch,
      UpdateInState: mapping.UpdateInState,
      RemoveFromState: mapping.RemoveFromState,
      AddToState: mapping.AddToState,
      Select: mapping.Select,
      Deselect: mapping.Deselect,
      SelectAll: mapping.SelectAll
    },
    {
      referenceEntity: "subaccount",
      strictSelect: false,
      keyReducers: {
        placeholders: createTablePlaceholdersReducer(
          {
            AddToState: mapping.Placeholders.AddToState,
            Activate: mapping.Placeholders.Activate,
            RemoveFromState: mapping.Placeholders.RemoveFromState,
            UpdateInState: mapping.Placeholders.UpdateInState,
            Clear: mapping.Request
          },
          SubAccountMapping,
          { referenceEntity: "subaccount" }
        ),
        groups: createListResponseReducer<IGroup<ISimpleSubAccount>, Redux.Calculator.IGroupsStore<ISimpleSubAccount>>(
          {
            Response: mapping.Groups.Response,
            Request: mapping.Groups.Request,
            Loading: mapping.Groups.Loading,
            RemoveFromState: mapping.Groups.RemoveFromState,
            AddToState: mapping.Groups.AddToState
          },
          {
            referenceEntity: "group",
            keyReducers: {
              deleting: createModelListActionReducer(mapping.Groups.Deleting, {
                referenceEntity: "group"
              })
            }
          }
        ),
        deleting: createModelListActionReducer(mapping.Deleting, {
          referenceEntity: "subaccount"
        }),
        updating: createModelListActionReducer(mapping.Updating, {
          referenceEntity: "subaccount"
        }),
        history: createListResponseReducer<HistoryEvent>(
          {
            Response: mapping.History.Response,
            Request: mapping.History.Request,
            Loading: mapping.History.Loading
          },
          { referenceEntity: "event" }
        ),
        creating: createSimpleBooleanReducer(mapping.Creating)
      }
    }
  );

  const recalculateGroupMetrics = (
    st: Redux.Calculator.ISubAccountsStore,
    groupId: number
  ): Redux.Calculator.ISubAccountsStore => {
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

  const recalculateSubAccountMetrics = (
    st: Redux.Calculator.ISubAccountsStore,
    id: number
  ): Redux.Calculator.ISubAccountsStore => {
    const subAccount = find(st.data, { id });
    if (isNil(subAccount)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State: Inconsistent state noticed when updating sub account in state. The
          sub account with ID ${id} does not exist in state when it is expected to.`
      );
      return st;
    } else {
      // In the case that the SubAccount has sub accounts itself, the estimated value is determined
      // from the accumulation of those individual estimated values.  In this case,  we do not need
      // to update the SubAccount estimated value in state because it only changes when the estimated
      // values of it's SubAccount(s) on another page are altered.
      if (subAccount.subaccounts.length === 0 && !isNil(subAccount.quantity) && !isNil(subAccount.rate)) {
        const multiplier = subAccount.multiplier || 1.0;
        let payload: Partial<ISubAccount> = {
          estimated: multiplier * subAccount.quantity * subAccount.rate
        };
        if (!isNil(subAccount.actual) && !isNil(payload.estimated)) {
          payload = { ...payload, variance: payload.estimated - subAccount.actual };
        }
        return {
          ...st,
          data: replaceInArray<ISubAccount>(
            st.data,
            { id: subAccount.id },
            {
              ...subAccount,
              ...payload
            }
          )
        };
      } else {
        return st;
      }
    }
  };

  return (
    state: Redux.Calculator.ISubAccountsStore = initialSubAccountsState,
    action: Redux.IAction<any>
  ): Redux.Calculator.ISubAccountsStore => {
    let newState = { ...state };

    newState = listResponseReducer(newState, action);

    // NOTE: The above ListResponseReducer handles updates to the Group itself or the SubAccount itself
    // via these same actions. However, it does not do any recalculation of the group values, because
    // it needs the state of the Group and the state of the SubAccount(s) to do so. This means moving
    // that logic/recalculation further up the reducer tree where we have access to the SubAccount(s)
    // in state.
    if (action.type === mapping.Groups.UpdateInState) {
      const group: IGroup<ISimpleSubAccount> = action.payload;
      newState = recalculateGroupMetrics(newState, group.id);
    } else if (action.type === mapping.UpdateInState) {
      const subAccount: ISubAccount = action.payload;
      newState = recalculateSubAccountMetrics(newState, subAccount.id);
      if (!isNil(subAccount.group)) {
        newState = recalculateGroupMetrics(newState, subAccount.group);
      }
    } else if (action.type === mapping.RemoveFromGroup || action.type === mapping.RemoveFromState) {
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

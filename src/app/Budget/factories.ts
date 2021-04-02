import { Reducer } from "redux";
import { isNil, find, includes, map, filter, reduce } from "lodash";
import { createSimpleBooleanReducer, createModelListActionReducer, createListResponseReducer } from "store/factories";
import { createListReducerFromTransformers } from "store/factories/util";
import Mapping, { SubAccountMapping } from "model/tableMappings";
import { replaceInArray } from "util/arrays";
import { mergeWithDefaults } from "util/objects";

import { initialSubAccountsState } from "./initialState";

interface SubAccountsPlaceholdersActionMap {
  AddToState: string;
  RemoveFromState: string;
  UpdateInState: string;
  Activate: string;
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

export const createTablePlaceholdersReducer = <
  /* eslint-disable indent */
  R extends Table.Row<G, C>,
  M extends Model,
  G extends IGroup<any>,
  P extends Http.IPayload,
  C extends Model = UnknownModel,
  A extends Redux.IAction<any> = Redux.IAction<any>
>(
  mappings: Partial<ReducerFactory.ITablePlaceholdersActionMap>,
  mapping: Mapping<R, M, G, P, C>,
  options: Partial<ReducerFactory.IOptions<Redux.ListStore<R>>> = { initialState: [], referenceEntity: "entity" }
) => {
  const Options = mergeWithDefaults<ReducerFactory.IOptions<Redux.ListStore<R>>>(options, {
    referenceEntity: "entity",
    initialState: []
  });

  const transformers: ReducerFactory.Transformers<ReducerFactory.ITablePlaceholdersActionMap, Redux.ListStore<R>, A> = {
    Clear: () => [],
    AddToState: (count: number | undefined, st: Redux.ListStore<R>) => {
      const placeholders: R[] = [];
      const numPlaceholders = count || 1;
      for (let i = 0; i < numPlaceholders; i++) {
        placeholders.push(mapping.createPlaceholder());
      }
      return [...st, ...placeholders];
    },
    RemoveFromState: (id: number, st: Redux.ListStore<R>) => {
      const row: R | undefined = find(st, { id: id } as any);
      if (isNil(row)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when removing the ${Options.referenceEntity}
          placeholder in state... the ${Options.referenceEntity} placeholder row with ID ${id}
          does not exist in state when it is expected to.`
        );
        return st;
      } else {
        return filter(st, (r: R) => r.id !== id);
      }
    },
    UpdateInState: (payload: R, st: Redux.ListStore<R>) => {
      const row: R | undefined = find(st, { id: payload.id } as any);
      if (isNil(row)) {
        /* eslint-disable no-console */
        console.error(
          `Inconsistent State!:  Inconsistent state noticed when updating the ${Options.referenceEntity}
          placeholder in state... the ${Options.referenceEntity} placeholder row with ID ${payload.id}
          does not exist in state when it is expected to.`
        );
        return st;
      } else {
        return replaceInArray<R>(
          st,
          { id: payload.id },
          {
            ...row,
            ...payload
          }
        );
      }
    }
  };
  return createListReducerFromTransformers<ReducerFactory.ITablePlaceholdersActionMap, R, A>(
    mappings,
    transformers,
    Options
  );
};

export const createSubAccountsReducer = (
  mapping: SubAccountsReducerFactoryActionMap
): Reducer<Redux.Budget.ISubAccountsStore, Redux.IAction<any>> => {
  const listResponseReducer = createListResponseReducer<ISubAccount, Redux.Budget.ISubAccountsStore>(
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
            RemoveFromState: mapping.Placeholders.RemoveFromState,
            UpdateInState: mapping.Placeholders.UpdateInState,
            Clear: mapping.Request
          },
          SubAccountMapping,
          { referenceEntity: "subaccount" }
        ),
        groups: createListResponseReducer<IGroup<ISimpleSubAccount>, Redux.Budget.IGroupsStore<ISimpleSubAccount>>(
          {
            Response: mapping.Groups.Response,
            Request: mapping.Groups.Request,
            Loading: mapping.Groups.Loading,
            RemoveFromState: mapping.Groups.RemoveFromState,
            AddToState: mapping.Groups.AddToState,
            UpdateInState: mapping.Groups.UpdateInState
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
    st: Redux.Budget.ISubAccountsStore,
    groupId: number
  ): Redux.Budget.ISubAccountsStore => {
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
    st: Redux.Budget.ISubAccountsStore,
    id: number
  ): Redux.Budget.ISubAccountsStore => {
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

  const recalculatePlaceholderMetrics = (
    st: Redux.Budget.ISubAccountsStore,
    id: number
  ): Redux.Budget.ISubAccountsStore => {
    const row = find(st.placeholders, { id });
    if (isNil(row)) {
      /* eslint-disable no-console */
      console.error(
        `Inconsistent State: Inconsistent state noticed when updating placeholder in state. The
            placeholder with ID ${id} does not exist in state when it is expected to.`
      );
      return st;
    } else {
      // Since we are dealing with a Placeholder row here, the row cannot have SubAccount(s) - thus
      // the estimated value cannot be determined from the accumulation of those estimated values.
      // Additionally, the Placeholder row cannot have an Actual value associated with it, so we
      // do not need to update the variance.
      if (!isNil(row.quantity) && !isNil(row.rate)) {
        const multiplier = row.multiplier || 1.0;
        return {
          ...st,
          placeholders: replaceInArray<Table.SubAccountRow>(
            st.placeholders,
            { id: row.id },
            {
              ...row,
              estimated: multiplier * row.quantity * row.rate
            }
          )
        };
      } else {
        return st;
      }
    }
  };

  return (
    state: Redux.Budget.ISubAccountsStore = initialSubAccountsState,
    action: Redux.IAction<any>
  ): Redux.Budget.ISubAccountsStore => {
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
    } else if (action.type === mapping.Placeholders.UpdateInState) {
      const row: Table.SubAccountRow = action.payload;
      newState = recalculatePlaceholderMetrics(newState, row.id);
    } else if (action.type === mapping.Placeholders.Activate) {
      // TODO: Do we need to recalculate group metrics here?
      const payload: Table.ActivatePlaceholderPayload<ISubAccount> = action.payload;
      newState = {
        ...newState,
        placeholders: filter(
          newState.placeholders,
          (placeholder: Table.SubAccountRow) => placeholder.id !== action.payload.id
        ),
        data: [...newState.data, payload.model]
      };
    }
    return newState;
  };
};

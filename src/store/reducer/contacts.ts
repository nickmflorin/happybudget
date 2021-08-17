import { Reducer } from "redux";
import { isNil, reduce, map, filter } from "lodash";

import { redux, tabling, util } from "lib";
import { ApplicationActionTypes } from "store/actions";

type R = Tables.ContactRow;
type M = Model.Contact;

const genericTableReducer: Reducer<
  Redux.TableStore<M>,
  Redux.Action<any>
> = redux.reducers.factories.createTableReducer({
  Response: ApplicationActionTypes.User.Contacts.Response,
  Request: ApplicationActionTypes.User.Contacts.Request,
  Loading: ApplicationActionTypes.User.Contacts.Loading,
  SetSearch: ApplicationActionTypes.User.Contacts.SetSearch,
  AddToState: ApplicationActionTypes.User.Contacts.AddToState,
  RemoveFromState: ApplicationActionTypes.User.Contacts.RemoveFromState,
  UpdateInState: ApplicationActionTypes.User.Contacts.UpdateInState,
  Creating: ApplicationActionTypes.User.Contacts.Creating,
  Updating: ApplicationActionTypes.User.Contacts.Updating,
  Deleting: ApplicationActionTypes.User.Contacts.Deleting
});

const contactsTableEventReducer: Reducer<Redux.TableStore<M>, Redux.Action<any>> = (
  state: Redux.TableStore<M> = redux.initialState.initialTableState,
  action: Redux.Action<Table.ChangeEvent<R, M>>
): Redux.TableStore<M> => {
  let newState: Redux.TableStore<M> = { ...state };

  // The table change e that is attached to the action.
  const e: Table.ChangeEvent<R, M> = action.payload;

  if (tabling.typeguards.isDataChangeEvent(e)) {
    const consolidated = tabling.util.consolidateTableChange(e.payload);

    // The consolidated changes should contain one change per Contact, but
    // just in case we apply that grouping logic here.
    let changesPerModel: {
      [key: number]: { changes: Table.RowChange<R, M>[]; model: M };
    } = {};
    for (let i = 0; i < consolidated.length; i++) {
      if (isNil(changesPerModel[consolidated[i].id])) {
        const m: M | null = redux.reducers.modelFromState<M>(action, newState.data as M[], consolidated[i].id);
        if (!isNil(m)) {
          changesPerModel[consolidated[i].id] = { changes: [], model: m };
        }
      }
      if (!isNil(changesPerModel[consolidated[i].id])) {
        changesPerModel[consolidated[i].id] = {
          ...changesPerModel[consolidated[i].id],
          changes: [...changesPerModel[consolidated[i].id].changes, consolidated[i]]
        };
      }
    }
    // For each of the Contact(s) that were changed,
    // apply those changes to the current Contact model in state.
    newState = reduce(
      changesPerModel,
      (s: Redux.TableStore<M>, data: { changes: Table.RowChange<R, M>[]; model: M }) => {
        const m: M = reduce(
          data.changes,
          (mi: M, change: Table.RowChange<R, M>) => tabling.util.mergeChangesWithModel(mi, change),
          data.model
        );
        s = {
          ...s,
          data: util.replaceInArray<M>(s.data as M[], { id: m.id }, m)
        };
        return s;
      },
      newState
    );
  } else if (tabling.typeguards.isRowAddEvent(e)) {
    // Eventually, we will want to implement this - so we do not have to rely on waiting
    // for the response of the API request.
  } else if (tabling.typeguards.isFullRowEvent(e)) {
    const ids = Array.isArray(e.payload.rows) ? map(e.payload.rows, (row: R) => row.id) : [e.payload.rows.id];

    if (tabling.typeguards.isRowDeleteEvent(e)) {
      newState = reduce(
        ids,
        (s: Redux.TableStore<M>, id: number) => {
          const m: M | null = redux.reducers.modelFromState<M, M[]>(action, newState.data as M[], id);
          if (!isNil(m)) {
            return {
              ...s,
              data: filter(s.data, (mi: M) => mi.id !== m.id),
              count: s.count - 1
            };
          }
          return s;
        },
        newState
      );
    }
  }
  return newState;
};

const contactsReducer: Reducer<Redux.TableStore<M>, Redux.Action<any>> = (
  state: Redux.TableStore<M> = redux.initialState.initialTableState,
  action: Redux.Action<any>
): Redux.TableStore<M> => {
  let newState: Redux.TableStore<M> = { ...state };
  newState = genericTableReducer(state, action);

  if (action.type === ApplicationActionTypes.User.Contacts.TableChanged) {
    newState = contactsTableEventReducer(newState, action);
  }
  return newState;
};

export default contactsReducer;

import * as api from "api";
import { tabling, model } from "lib";

import * as errors from "../../errors";

export type ListStore<T> = {
  readonly data: T[];
  /**
   * The total number of results that exist for the endpoint - not the number of results returned
   * from the API request.  Used for pagination.
   */
  readonly count: number;
  /**
   * The query that was used to obtain the data currently in the store.  Used when determining
   * whether or not the previously requested results can be reused.
   */
  readonly query: api.ListQuery;
  readonly loading: boolean;
  /**
   * Indicates whether or not the data in the store is the result of an API request versus the
   * initial state.
   *
   * Unlike the {@link ModelDetailStore}, when dealing with list responses we cannot simply check
   * if the data was received already from an API request based on a null/non-null value (or
   * empty/not-empty value) because the data received from the API may in fact be an empty list.
   */
  readonly responseWasReceived: boolean;
  /*
		Used to inform the store that the current results should be invalidated and
		the next request to obtain the data should be performed regardless of
		whether or not the data is already in the store.
		*/
  readonly invalidated: boolean;
  /**
   * The error that occurred (if any) during the previous API request to populate the store.  Used
   * when determining whether or not the previously requested results can be reused.
   */
  readonly error: errors.HttpError | null;
};

export type ModelListStore<T extends model.ApiModel> = ListStore<T>;

export type AuthenticatedModelListStore<M extends model.ApiModel> = ModelListStore<M> & {
  readonly search: string;
  readonly page: number;
  readonly pageSize: number;
  readonly deleting: ModelListActionStore;
  readonly updating: ModelListActionStore;
  readonly creating: boolean;
  readonly ordering: api.Ordering<string>;
};

export type ModelDetailStore<T extends model.ApiModel> = {
  /**
   * The data object received from the API that conforms to the generically provided ApiModel
   * type.  This will be null in the case that the request resulted in an error or the response
   * has not yet been received.
   */
  readonly data: T | null;
  readonly loading: boolean;
  /**
   * The error that occurred (if any) during the previous API request to populate the store.  Used
   * when determining whether or not the previously requested results can be reused.
   */
  readonly error: errors.HttpError | null;
  /**
   * Informs the store that the current results should be invalidated and the next request to
   * obtain the data should be performed regardless of whether or not the data is already in the
   * store.
   */
  readonly invalidated: boolean;
};

export type ModelIndexedStore<S> = { [key: number]: S };

export type ModelListActionStore<M extends model.Model = model.Model> = {
  readonly current: M["id"][];
  readonly completed: M["id"][];
  readonly failed: M["id"][];
};

export type TableStore<R extends tabling.Row = tabling.Row> = {
  /* Note: Even though the TableStore object is very analogous to the ModelListStore object, the
     `count` is not applicable - because requests for the models that comprise the data used to
     generate tables will always return all of the relevant models as pagination is not currently
     supported in tables. */
  readonly data: tabling.Row<R, tabling.BodyRowType>[];
  /* We do not need to maintain a history of the previous search, as it relates to making decisions
     about whether or not previously requested results can be used, because searching is performed
     client side for the tables via AGGrid, at least currently.  Query strings currently are not
     applicable for requests to obtain table data (at least query strings that would be applicable
     in making decisions about whether or not previously requested results can be used). */
  readonly search: string;
  readonly loading: boolean;
  /**
   * A history of user submitted events that alter the data in the table, and the current index of
   * the event history that represents the current state of the table.  Used for undo/redo behavior.
   */
  readonly eventHistory: tabling.ChangeEventHistory<tabling.Row<R, tabling.EditableRowType>>;
  readonly eventIndex: number;
  /**
   * Indicates whether or not the data in the store is the result of an API request versus the
   * initial state.
   *
   * Unlike the {@link ModelDetailStore}, when dealing with list responses we cannot simply check
   * if the data was received already from an API request based on a null/non-null value (or
   * empty/not-empty value) because the data received from the API may in fact be an empty list.
   */
  readonly responseWasReceived: boolean;
  /**
   * Informs the store that the current results should be invalidated and the next request to
   * obtain the data should be performed regardless of whether or not the data is already in the
   * store.
   */
  readonly invalidated: boolean;
  /**
   * The error that occurred (if any) during the previous API request to populate the store.  Used
   * when determining whether or not the previously requested results can be reused.
   */
  readonly error: errors.HttpError | null;
};

export type BudgetTableStore<R extends tabling.Row<model.BudgetRowData>> = TableStore<R>;

export type ActualTableStore = TableStore<model.ActualRow> & {
  readonly owners: AuthenticatedModelListStore<model.ActualOwner>;
};
export type FringeTableStore = TableStore<model.FringeRow>;
export type SubAccountTableStore = BudgetTableStore<model.SubAccountRow>;
export type ContactTableStore = TableStore<model.ContactRow>;
export type AccountTableStore = BudgetTableStore<model.AccountRow>;

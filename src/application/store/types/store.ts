import { model } from "lib";

import * as api from "../../api";
import * as errors from "../../errors";

export type ListStore<T extends api.ListResponseIteree> = {
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
   * Unlike the {@link ApiModelDetailStore}, when dealing with list responses we cannot simply check
   * if the data was received already from an API request based on a null/non-null value (or
   * empty/not-empty value) because the data received from the API may in fact be an empty list.
   */
  readonly responseWasReceived: boolean;
  /**
   * Informs the store that the current results should be invalidated and the next request to obtain
   * data should be performed regardless of whether or not the data is already in the store.
   */
  readonly invalidated: boolean;
  /**
   * The error that occurred (if any) during the previous API request to populate the store.  Used
   * when determining whether or not the previously requested results can be reused.
   */
  readonly error: errors.HttpError | null;
};

export type ApiModelListStore<T extends model.ApiModel> = ListStore<T>;

export type AuthenticatedApiModelListStore<M extends model.ApiModel> = ListStore<M> & {
  readonly search: string;
  readonly page: number;
  readonly pageSize: number;
  readonly deleting: ModelListActionStore;
  readonly updating: ModelListActionStore;
  readonly creating: boolean;
  readonly ordering: api.ModelOrdering<M>;
};

export type ApiModelDetailStore<T extends model.ApiModel> = {
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

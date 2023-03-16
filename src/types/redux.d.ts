declare namespace Redux {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type GenericSelectorFunc<S, T = any> = (state: S) => T;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type SelectorFunc<T = any> = GenericSelectorFunc<Application.Store, T>;

  type ActionPayloadMap = Record<string, ActionPayload>;

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type ActionPayload = any;

  type InferAction<CREATOR> = CREATOR extends ActionCreator<infer P, infer C>
    ? Action<P, C>
    : never;

  type Task<P extends ActionPayload = ActionPayload, C extends ActionContext = ActionContext> = (
    action: Action<P, C>,
  ) => import("@redux-saga/types").SagaIterator;

  type ContextTask<C extends ActionContext = ActionContext> = (
    context?: C,
  ) => import("@redux-saga/types").SagaIterator;

  type ActionContext = {
    readonly publicTokenId?: string;
    readonly errorMessage?: string;
  };

  type WithActionContext<T> = T extends null ? ActionContext : T & ActionContext;

  type TableChangeEventTask<
    E extends Table.ChangeEvent<R>,
    R extends Table.RowData,
    C extends ActionContext = ActionContext,
  > = (e: E, context: C) => import("@redux-saga/types").SagaIterator;

  type TableChangeEventTaskMapObject<
    R extends Table.RowData,
    C extends ActionContext = ActionContext,
  > = {
    readonly dataChange: TableChangeEventTask<Table.DataChangeEvent<R>, R, C>;
    readonly rowAdd: TableChangeEventTask<Table.RowAddEvent<R>, R, C>;
    readonly groupAdd: TableChangeEventTask<Table.GroupAddEvent, R, C>;
    readonly groupUpdate: TableChangeEventTask<Table.GroupUpdateEvent, R, C>;
    readonly markupAdd: TableChangeEventTask<Table.MarkupAddEvent, R, C>;
    readonly markupUpdate: TableChangeEventTask<Table.MarkupUpdateEvent, R, C>;
    readonly rowInsert: TableChangeEventTask<Table.RowInsertEvent<R>, R, C>;
    readonly rowPositionChanged: TableChangeEventTask<Table.RowPositionChangedEvent, R, C>;
    readonly rowDelete: TableChangeEventTask<Table.RowDeleteEvent, R, C>;
    readonly rowRemoveFromGroup: TableChangeEventTask<Table.RowRemoveFromGroupEvent, R, C>;
    readonly rowAddToGroup: TableChangeEventTask<Table.RowAddToGroupEvent, R, C>;
  };

  type BasicReducer<S, A = Action> = import("redux").Reducer<S, A>;

  type BasicDynamicReducer<S, ARG, A> = (s: S | undefined, a: A, arg?: ARG) => S;

  type BasicDynamicRequiredReducer<S, ARG, A> = (s: S | undefined, a: A, arg: ARG) => S;

  type Reducer<
    S,
    C extends ActionContext = ActionContext,
    A extends AnyPayloadAction<C> = AnyPayloadAction<C>,
  > = BasicReducer<S, A>;

  type DynamicReducer<
    S,
    ARG,
    C extends ActionContext = ActionContext,
    A extends AnyPayloadAction<C> = AnyPayloadAction<C>,
  > = BasicDynamicReducer<S, ARG, A>;

  type DynamicRequiredReducer<
    S,
    ARG,
    C extends ActionContext = ActionContext,
    A extends AnyPayloadAction<C> = AnyPayloadAction<C>,
  > = BasicDynamicRequiredReducer<S, ARG, A>;

  type BasicReducerWithDefinedState<S, A = Action> = (s: S, a: A) => S;

  type ReducerWithDefinedState<
    S,
    C extends ActionContext = ActionContext,
    A extends AnyPayloadAction<C> = AnyPayloadAction<C>,
  > = BasicReducerWithDefinedState<S, A>;

  type ReducersMapObject<
    S,
    C extends ActionContext = ActionContext,
    A extends AnyPayloadAction<C> = AnyPayloadAction<C>,
  > = {
    [K in keyof S]-?: Reducer<S[K], C, A>;
  };

  type StoreObj = Record<string, unknown> | boolean | number;

  type Store<S extends Application.Store> = import("redux").Store<S, Action> & {
    readonly injectSaga: (key: string, saga: import("redux-saga").Saga) => boolean;
    readonly ejectSaga: (key: string) => boolean;
    readonly hasSaga: (key: string) => boolean;
  };

  type Dispatch = import("redux").Dispatch<Action>;

  type BasicAction<P extends ActionPayload = ActionPayload, T extends string = string> = {
    readonly payload: P;
    readonly type: T;
  };

  type Action<
    P extends ActionPayload = ActionPayload,
    C extends ActionContext = ActionContext,
    T extends string = string,
  > = BasicAction<P, T> & {
    readonly context: C;
    readonly label: string | null;
    readonly user?: Model.User | null;
  };

  type AnyPayloadAction<
    C extends ActionContext = ActionContext,
    T extends string = string,
  > = Action<ActionPayload, C, T>;

  type ActionCreator<
    P extends ActionPayload = ActionPayload,
    C extends ActionContext = ActionContext,
  > = {
    type: string;
    label: string | null;
    toString: () => string;
    (p: P, ctx: Omit<C, "publicTokenId">): Action<P>;
  };

  type AnyPayloadActionCreator<C extends ActionContext = ActionContext> = ActionCreator<
    ActionPayload,
    C
  >;

  type TaskConfig<
    A extends ActionCreatorMap<ActionPayloadMap, C>,
    C extends ActionContext = ActionContext,
  > = {
    readonly actions: Omit<A, "request">;
  };

  type ReducerConfig<
    S,
    A extends ActionCreatorMap<ActionPayloadMap, C>,
    C extends ActionContext = ActionContext,
  > = {
    readonly initialState: S;
    readonly actions: Partial<A>;
  };

  type SagaConfig<
    T,
    A extends ActionCreatorMap<ActionPayloadMap, C>,
    C extends ActionContext = ActionContext,
  > = {
    readonly tasks: T;
    readonly actions: A;
  };

  type ModelListActionCompleteAction<M extends Model.Model = Model.Model> = {
    readonly id: M["id"];
    readonly value: false;
    readonly success?: boolean;
  };
  type ModelListActionStartAction<M extends Model.Model = Model.Model> = {
    readonly id: M["id"];
    readonly value: true;
  };

  type ModelListActionAction<M extends Model.Model = Model.Model> =
    | ModelListActionStartAction<M>
    | ModelListActionCompleteAction<M>;

  type ModelListActionStore<M extends Model.Model = Model.Model> = {
    readonly current: M["id"][];
    readonly completed: M["id"][];
    readonly failed: M["id"][];
  };

  type UpdateModelPayload<T extends Model.Model> = {
    id: T["id"];
    data: Partial<T>;
  };

  type UserMetricsIncrementByPayload = {
    readonly incrementBy: number;
    readonly metric: keyof Model.User["metrics"];
  };

  type UserMetricsDecrementByPayload = {
    readonly decrementBy: number;
    readonly metric: keyof Model.User["metrics"];
  };

  type UserMetricsChangePayload = {
    readonly change: "increment" | "decrement";
    readonly metric: keyof Model.User["metrics"];
  };

  type UserMetricsValuePayload = {
    readonly value: number;
    readonly metric: keyof Model.User["metrics"];
  };

  type UserMetricsActionPayload =
    | UserMetricsIncrementByPayload
    | UserMetricsDecrementByPayload
    | UserMetricsChangePayload
    | UserMetricsValuePayload;

  type UserMetricsAction =
    | Action<UserMetricsIncrementByPayload>
    | Action<UserMetricsDecrementByPayload>
    | Action<UserMetricsChangePayload>
    | Action<UserMetricsValuePayload>;

  type HttpUpdateModelPayload<T extends Model.Model, P> = {
    id: T["id"];
    data: Partial<P>;
  };

  type RequestPayload = null | { force: true };
  type TableRequestPayload = { ids: number[] } | RequestPayload;

  /* The return type will be `null` in the case that the data is already
     present in the store. */
  type RequestEffectError = { readonly error: Error };
  type ListRequestEffectRT<C> = Http.RenderedListResponse<C> | null;
  type ListRequestEffectRTWithError<C> = ListRequestEffectRT<C> | RequestEffectError;

  type UpdateOrderingPayload<F extends string = string> = { field: F; order: Http.Order };

  type ModelDetailStore<T extends Model.HttpModel> = {
    /*
		The data object received from the API that conforms to the generically
		provided HttpModel type.  Will be null in the case that the request resulted
		in an error or the response was not yet received.
		*/
    readonly data: T | null;
    readonly loading: boolean;
    /*
		The error that occurred (if any) that is associated with the data in the
		store populated from the last request.  Used to determine if the previously
		requested results can be used.
		*/
    readonly error: import("api").RequestError | null;
    /*
		Used to inform the store that the current results should be invalidated and
		the next request to obtain the data should be performed regardless of
		whether or not the data is already in the store.
		*/
    readonly invalidated: boolean;
  };

  type ModelDetailActionPayloadMap<M extends Model.HttpModel> = {
    readonly loading: boolean;
    readonly response: Http.RenderedDetailResponse<M>;
    readonly updateInState: UpdateModelPayload<M>;
    readonly invalidate: null;
  };

  type ActionCreatorMap<S extends ActionPayloadMap, C extends ActionContext = ActionContext> = {
    [K in keyof S]-?: ActionCreator<S[K], C>;
  };

  type ListStore<T> = {
    readonly data: T[];
    /*
		The total number of results that exist for the endpoint - not the number
		of results returned from the API request.  Used for pagination.
		*/
    readonly count: number;
    /*
		The query that was used to obtain the data currently in the store.  Used
		to determine whether or not the previously requested results can be
		used.
		*/
    readonly query: Http.ListQuery;
    readonly loading: boolean;
    /*
		Indicates whether or not the data populated in the store is the result of
		data received from the API, versus the initial state.

		Unlike the ModelDetailStore, when dealing with list responses we cannot
		simply check if the data was received already from an API request based on
		a null/non-null value (or empty/non-empty value) because the data received
		from the APImay in fact be an empty list, meaning we cannot use the
		presence or lack of presence of data to determine if the response was already
		received.  So an additional state parameter must be used.
		*/
    readonly responseWasReceived: boolean;
    /*
		Used to inform the store that the current results should be invalidated and
		the next request to obtain the data should be performed regardless of
		whether or not the data is already in the store.
		*/
    readonly invalidated: boolean;
    /*
		The error that occurred (if any) that is associated with the data in the
		store populated from the last request.  Used to determine if the previously
		requested results can be used.
		*/
    readonly error: import("api").RequestError | null;
  };

  type ListActionPayloadMap<T> = {
    readonly request: RequestPayload;
    readonly loading: boolean;
    readonly invalidate: boolean;
    readonly response: Http.RenderedListResponse<T>;
  };

  /*
	We have to define the request ActionCreatorMap like this because a request
	action that takes just `null` as it's payload is completely valid but will
	not be treated as such due to distributed types of ActionCreatorMap across
	the Union type RequestPayload.
	*/
  type RequestAction<C extends ActionContext = ActionContext> =
    | Action<RequestPayload, C>
    | Action<TableRequestPayload, C>;

  type RequestActionCreator<C extends ActionContext = ActionContext> =
    | ActionCreator<RequestPayload, C>
    | ActionCreator<TableRequestPayload, C>;

  type ListActionCreatorMap<T, C extends ActionContext = ActionContext> = Omit<
    ActionCreatorMap<ListActionPayloadMap<T>, C>,
    "request"
  > & { readonly request: RequestActionCreator<C> };

  type ListTaskMap<C extends ActionContext = ActionContext> = {
    readonly request: Task<RequestPayload, C> | Task<null, C>;
  };

  type ModelListStore<T extends Model.HttpModel> = ListStore<T>;

  type AuthenticatedModelListStore<M extends Model.HttpModel> = ModelListStore<M> & {
    readonly search: string;
    readonly page: number;
    readonly pageSize: number;
    readonly deleting: ModelListActionStore;
    readonly updating: ModelListActionStore;
    readonly creating: boolean;
    readonly ordering: Http.Ordering<string>;
  };

  type ModelListActionPayloadMap<M extends Model.HttpModel> = ListActionPayloadMap<M>;
  type ModelListActionCreatorMap<
    M extends Model.HttpModel,
    C extends ActionContext = ActionContext,
  > = Omit<ActionCreatorMap<ModelListActionPayloadMap<M>, C>, "request"> & {
    readonly request: RequestActionCreator<C>;
  };

  type AuthenticatedModelListActionPayloadMap<M extends Model.HttpModel> =
    ModelListActionPayloadMap<M> & {
      readonly updating: ModelListActionAction;
      readonly creating: boolean;
      readonly removeFromState: number;
      readonly deleting: ModelListActionAction;
      readonly addToState: M;
      readonly updateInState: UpdateModelPayload<M>;
      readonly setSearch: string;
      readonly setPagination: Pagination;
      readonly updateOrdering: UpdateOrderingPayload<string>;
    };
  type AuthenticatedModelListActionCreatorMap<
    M extends Model.HttpModel,
    C extends ActionContext = ActionContext,
  > = Omit<ActionCreatorMap<AuthenticatedModelListActionPayloadMap<M>, C>, "request"> & {
    readonly request: RequestActionCreator<C>;
  };

  type ModelListTaskMap<C extends ActionContext = ActionContext> = {
    readonly request: Task<RequestPayload, C> | Task<null, C>;
  };

  type TableTaskMap<C extends ActionContext = ActionContext> = {
    readonly request: Task<TableRequestPayload, C> | Task<null, C>;
  };

  type AuthenticatedTableTaskMap<
    R extends Table.RowData,
    C extends ActionContext = ActionContext,
  > = TableTaskMap<C> & {
    readonly handleChangeEvent: TableChangeEventTask<Table.ChangeEvent<R>, R, C>;
  };

  type TableActionPayloadMap<M extends Model.RowHttpModel = Model.RowHttpModel> = {
    readonly request: TableRequestPayload;
    readonly loading: boolean;
    readonly response: Http.TableResponse<M>;
    readonly setSearch: string;
    readonly invalidate: null;
  };

  type TableActionCreatorMap<
    M extends Model.HttpModel,
    C extends ActionContext = ActionContext,
  > = Optional<ActionCreatorMap<TableActionPayloadMap<M>, C>, "invalidate">;

  type AuthenticatedTableActionPayloadMap<
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
  > = TableActionPayloadMap<M> & {
    readonly handleEvent: Table.Event<R, M>;
  };

  type AuthenticatedTableActionCreatorMap<
    R extends Table.RowData,
    M extends Model.HttpModel,
    C extends ActionContext = ActionContext,
  > = Optional<ActionCreatorMap<AuthenticatedTableActionPayloadMap<R, M>, C>, "invalidate">;

  type TableStore<D extends Table.RowData = Table.RowData> = {
    /*
		Note that even though the TableStore object is very analogous to the
		ModelListStore object, the `count` is not applicable - because requests
		for the models that comprise the data used to generate tables will always
		return all of the relevant models as pagination is not currently supported
		in tables.
		*/
    readonly data: Table.BodyRow<D>[];
    /*
		We do not need to maintain a history of the previous search, as it relates
		to making decisions about whether or not previously requested results can
		be used, because searching is performed client side for the tables via
		AGGrid, at least currently.  Query strings currently are not applicable
		for requests to obtain table data (at least query strings that would
		be applicable in making decisions about whether or not previously requested
		results can be used).
		*/
    readonly search: string;
    readonly loading: boolean;
    /*
		A history of user submitted events that alter the data in the table, and
		the current index of the event history that repesents the current state of
		the table.  Used for undo/redo behavior.
		*/
    readonly eventHistory: Table.ChangeEventHistory<D>;
    readonly eventIndex: number;
    /*
		Indicates whether or not the data populated in the store is the result of
		data received from the API, versus the initial state.

		Unlike the ModelDetailStore, when dealing with list responses we cannot
		simply check if the data was received already from an API request based on
		a null/non-null value (or empty/non-empty value) because the data received
		from the APImay in fact be an empty list, meaning we cannot use the
		presence or lack of presence of data to determine if the response was already
		received.  So an additional state parameter must be used.
		*/
    readonly responseWasReceived: boolean;
    /*
		Used to inform the store that the current results should be invalidated and
		the next request to obtain the data should be performed regardless of
		whether or not the data is already in the store.
		*/
    readonly invalidated: boolean;
    /*
		The error that occurred (if any) that is associated with the data in the
		store populated from the last request.  Used to determine if the previously
		requested results can be used.
		*/
    readonly error: import("api").RequestError | null;
  };

  type RecalculateRowReducerCallback<S extends TableStore<R>, R extends Table.RowData> = (
    state: S,
    row: Table.DataRow<R>,
  ) => Partial<R>;

  type BudgetTableStore<R extends Tables.BudgetRowData> = TableStore<R>;

  type ModelIndexedStore<S> = { [key: number]: S };
}

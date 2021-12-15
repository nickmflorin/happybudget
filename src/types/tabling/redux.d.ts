declare namespace Table {
  type RowDataSelector<R extends RowData> = (state: Application.Store) => Partial<R>;

  type TaskConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    C = any,
    A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>
  > = Redux.TaskConfig<A> & {
    /* There are edge cases where the table will be null when switching between
		   tables very fast. */
    readonly table: PotentiallyNullRef<Table.TableInstance<R, M>>;
  };

  type ReducerConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    C = any,
    A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>
  > = Omit<TaskConfig<R, M, C, A>, "table"> & {
    readonly initialState: S;
    readonly columns: Column<R, M>[];
    readonly defaultData?: Partial<R>;
    readonly getModelRowChildren?: (m: M) => number[];
    readonly clearOn: Redux.ClearOn<any, C>[];
  };

  type SagaConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    C = any,
    A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>
  > = Redux.SagaConfig<Redux.TableTaskMap<R, M, C>, A>;

  type StoreConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    C = any,
    A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>
  > = {
    readonly asyncId?: AsyncId;
    readonly actions: Omit<A, "request">;
    readonly footerRowSelectors?: Partial<FooterGridSet<RowDataSelector<R>>>;
    readonly onSagaConnected: (dispatch: import("redux").Dispatch, context: C) => void;
    readonly onSagaReconnected?: (dispatch: import("redux").Dispatch, context: C) => void;
    readonly selector?: (state: Application.Store) => S;
    readonly reducer?: Redux.Reducer<S>;
    readonly createSaga?: (t: NonNullRef<Table.TableInstance<R, M>>) => Saga<any[]>;
  };
}

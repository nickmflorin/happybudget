declare namespace Table {
  type RowDataSelector<R extends RowData> = (state: Application.Store) => Partial<R>;

  type TaskConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>
  > = Redux.TaskConfig<A> & {
    readonly columns: Column<R, M>[];
  };

  type ReducerConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>,
    CFG extends CreateTableDataConfig<R, M> = CreateTableDataConfig<R, M>
  > = TaskConfig<R, M, A> &
    Omit<CFG, "gridId" | "response"> & {
      readonly initialState: S;
      readonly defaultData?: Partial<R>;
      readonly createTableRows?: (config: CFG) => BodyRow<R>[];
      readonly getModelRowChildren?: (m: M) => number[];
      readonly clearOn: Redux.ClearOn<any>[];
    };

  type SagaConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    A extends Redux.TableActionMap<M> = Redux.TableActionMap<M>
  > = Redux.SagaConfig<Redux.TableTaskMap<R, M>, A>;

  type StoreConfig<
    R extends RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    A extends Redux.TableActionMap<M> & { readonly request?: Redux.TableRequestPayload } = Redux.TableActionMap<M> & {
      readonly request?: Redux.TableRequestPayload;
    }
  > = {
    readonly autoRequest?: boolean;
    readonly asyncId?: AsyncId;
    readonly actions: Redux.ActionMapObject<A>;
    readonly selector?: (state: Application.Store) => S;
    readonly footerRowSelectors?: Partial<FooterGridSet<RowDataSelector<R>>>;
    readonly reducer?: Redux.Reducer<S>;
  };
}

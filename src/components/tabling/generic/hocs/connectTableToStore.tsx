import { useEffect } from "react";
import { useStore, useSelector, useDispatch } from "react-redux";
import hoistNonReactStatics from "hoist-non-react-statics";

import { isNil } from "lodash";
import { redux, tabling } from "lib";

type ProvidedProps<
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
> = {
  readonly search: string;
  readonly data: Table.Row<R, M>[];
  readonly groups?: G[];
  readonly loading: boolean;
  readonly saving: boolean;
  readonly selector: (state: Application.Store) => S;
  readonly footerRowSelectors?: Partial<Table.FooterGridSet<Table.RowDataSelector<R>>>;
  readonly onSearch: (v: string) => void;
  readonly onChangeEvent: (e: Table.ChangeEvent<R, M, G>) => void;
};

export type WithConnectedTableProps<
  T,
  R extends Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
> = T & ProvidedProps<R, M, G, S>;

/* eslint-disable indent */
const connectTableToStore =
  <
    T,
    R extends Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
  >(
    config: Table.StoreConfig<R, M, G, S>
  ) =>
  (
    Component:
      | React.ComponentClass<WithConnectedTableProps<T, R, M, G, S>, {}>
      | React.FunctionComponent<WithConnectedTableProps<T, R, M, G, S>>
  ): React.FunctionComponent<T> => {
    let selector: (state: Application.Store) => S = (state: Application.Store) =>
      redux.initialState.initialTableState as S;

    if (!isNil(config.asyncId)) {
      selector = (state: Application.Store) => state[config.asyncId as Table.AsyncId] as S;
    } else if (!isNil(config.selector)) {
      selector = config.selector;
    }
    const selectGroups = (state: Application.Store) => selector(state)?.groups || [];
    const selectData = (state: Application.Store) => selector(state)?.data || [];
    const selectSearch = (state: Application.Store) => selector(state)?.search || "";
    const selectSaving = (state: Application.Store) => selector(state)?.saving || false;
    const selectLoading = (state: Application.Store) => selector(state)?.loading || false;

    const WithStoreConfigured = (props: T) => {
      const store: Redux.Store<Application.Store> = useStore() as Redux.Store<Application.Store>;
      const data = useSelector(selectData);
      const search = useSelector(selectSearch);
      const loading = useSelector(selectLoading);
      const groups = useSelector(selectGroups);
      const saving = useSelector(selectSaving);
      const dispatch = useDispatch();

      useEffect(() => {
        const asyncId = config.asyncId;
        if (!isNil(asyncId) && !isNil(config.reducer)) {
          store.reducerManager.injectReducer(asyncId, config.reducer);
          return () => {
            store.reducerManager.ejectReducer(asyncId);
          };
        }
      }, []);

      useEffect(() => {
        if (config.autoRequest !== false && !isNil(config.actions.request)) {
          dispatch(config.actions.request(null));
        }
      }, []);

      return (
        <Component
          {...props}
          search={search}
          data={data}
          groups={groups}
          loading={loading}
          selector={selector}
          footerRowSelectors={config.footerRowSelectors}
          saving={saving}
          onChangeEvent={(e: Table.ChangeEvent<R, M, G>) =>
            tabling.typeguards.isAuthenticatedActionMap<R, M, G>(config.actions) &&
            dispatch(config.actions.tableChanged(e))
          }
          onSearch={(v: string) => dispatch(config.actions.setSearch(v))}
        />
      );
    };
    return hoistNonReactStatics(WithStoreConfigured, Component);
  };

export default connectTableToStore;

import React, { useEffect, useState, useRef } from "react";
import { useStore, useSelector } from "react-redux";
import { Subtract } from "utility-types";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isNil } from "lodash";
import { redux } from "lib";

export type ConnectedTableInjectedProps<R extends Table.RowData, S extends Redux.TableStore<R>> = {
  /* TODO: Figure out how to inject the tableId from the config into props so
     we do not have to specify it both as a part of the config and the props.
     readonly tableId: string; */
  readonly search: string;
  readonly data: Table.BodyRow<R>[];
  readonly loading: boolean;
  readonly footerRowSelectors?: Partial<Table.FooterGridSet<Table.RowDataSelector<R>>>;
  readonly selector: (s: Application.Store) => S;
};

export type ConnectTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  S extends Redux.TableStore<R>,
  C extends Table.Context = Table.Context
> = {
  readonly actionContext: C;
  readonly table: NonNullRef<Table.TableInstance<R, M>>;
  readonly selector?: (s: Application.Store) => S;
  readonly createSaga?: (t: Table.TableInstance<R, M>) => import("redux-saga").Saga;
};

export type StoreConfig<R extends Table.RowData, M extends Model.RowHttpModel, S extends Redux.TableStore<R>> = {
  readonly tableId: string;
  readonly footerRowSelectors?: Partial<Table.FooterGridSet<Table.RowDataSelector<R>>>;
  readonly reducer?: Redux.Reducer<S>;
  /* The table store selector can either be passed in as a configuration or
		 in the props.  The preference is as a configuration, but there are cases
		 where the selector depends on props of the parent component and needs
		 to be passed in as a prop to the connected component. */
  readonly selector?: (s: Application.Store) => S;
  /* The saga factory can either be passed in as a configuration or in the
	   props.  The preference is as a configuration, but there are cases where the
		 factory depends on props of the parent component and needs to be passed in
		 as a prop to the connected component. */
  readonly createSaga?: (t: Table.TableInstance<R, M>) => import("redux-saga").Saga;
};

type HOCProps<
  T extends ConnectedTableInjectedProps<R, S>,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  S extends Redux.TableStore<R>,
  C extends Table.Context = Table.Context
> = Subtract<T, ConnectedTableInjectedProps<R, S>> & ConnectTableProps<R, M, S, C>;

const connectTableToStore =
  <
    T extends ConnectedTableInjectedProps<R, S>,
    R extends Table.RowData,
    M extends Model.RowHttpModel,
    S extends Redux.TableStore<R>,
    C extends Table.Context = Table.Context
  >(
    config: StoreConfig<R, M, S>
  ) =>
  (Component: React.FunctionComponent<T>): React.FunctionComponent<HOCProps<T, R, M, S, C>> => {
    let configuredSelector: (state: Application.Store) => S = () => redux.initialTableState as S;
    if (!isNil(config.selector)) {
      configuredSelector = config.selector;
    }

    const selectData = (state: Application.Store) => configuredSelector(state)?.data || [];
    const selectSearch = (state: Application.Store) => configuredSelector(state)?.search || "";
    const selectLoading = (state: Application.Store) => configuredSelector(state)?.loading || false;

    const _selectData = (s: Application.Store, p: HOCProps<T, R, M, S, C>) =>
      isNil(p.selector) ? selectData(s) : p.selector(s).data;

    const _selectLoading = (s: Application.Store, p: HOCProps<T, R, M, S, C>) =>
      isNil(p.selector) ? selectLoading(s) : p.selector(s).loading;

    const _selectSearch = (s: Application.Store, p: HOCProps<T, R, M, S, C>) =>
      isNil(p.selector) ? selectSearch(s) : p.selector(s).search;

    const WithStoreConfigured = (props: HOCProps<T, R, M, S, C>) => {
      const store: Redux.Store<Application.Store> = useStore() as Redux.Store<Application.Store>;
      const data = useSelector((s: Application.Store) => _selectData(s, props));
      const search = useSelector((s: Application.Store) => _selectSearch(s, props));
      const loading = useSelector((s: Application.Store) => _selectLoading(s, props));

      const [ready, setReady] = useState(false);
      const sagaInjected = useRef<boolean>(false);

      /* It is extremely important that the ONLY dependency to this Saga is
				 the `table` - if additional dependencies are added, it can lead to
				 multiple Sagas being created for a given table... which means every
				 action will make multiple requests to the backend API. */
      useEffect(() => {
        const createSaga = config.createSaga || props.createSaga;
        if (!isNil(createSaga)) {
          if (sagaInjected.current === false) {
            if (!store.hasSaga(`${config.tableId}-saga`)) {
              const saga = createSaga(props.table.current);
              store.injectSaga(`${config.tableId}-saga`, saga);
            }
            sagaInjected.current = true;
            setReady(true);
            return () => {
              store.ejectSaga(`${config.tableId}-saga`);
            };
          }
        } else {
          setReady(true);
        }
      }, [props.table.current]);

      return (
        <Component
          {...(props as T & ConnectTableProps<R, M, S, C>)}
          tableId={config.tableId}
          search={search}
          /* This is necessary in order to not show stale data in a "flash" when
					 the page initially loads and before the data in the store is
					 updated.  The time between the stale data "flash" and the updated
					 data is visible in the table is the time that it takes to inject
					 the Saga. */
          data={ready === true ? data : []}
          loading={loading}
          selector={props.selector || configuredSelector}
          footerRowSelectors={config.footerRowSelectors}
        />
      );
    };
    return hoistNonReactStatics(WithStoreConfigured, Component);
  };

export default connectTableToStore;

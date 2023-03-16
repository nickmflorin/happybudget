import React, { useEffect, useState, useRef, useMemo } from "react";

import hoistNonReactStatics from "hoist-non-react-statics";
import { isNil } from "lodash";
import { useStore, useSelector } from "react-redux";
import { createSelector } from "reselect";
import { Subtract } from "utility-types";

import { redux } from "lib";

export type ConnectedTableInjectedProps<R extends Table.RowData, S extends Redux.TableStore<R>> = {
  /*
	TODO: Figure out how to inject the tableId from the config into props so
	we do not have to specify it both as a part of the config and the props.
	readonly tableId: string;
	*/
  readonly search: string;
  readonly data: Table.BodyRow<R>[];
  readonly loading: boolean;
  readonly footerRowSelectors?: Partial<Table.FooterGridSet<Table.RowDataSelector<R>>>;
  readonly selector: (s: Application.Store) => S;
};

export type ConnectTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> = {
  readonly tableContext: C;
  readonly table: NonNullRef<Table.TableInstance<R, M>>;
  readonly selector?: (s: Application.Store) => S;
  readonly createSaga?: (t: Table.TableInstance<R, M>) => import("redux-saga").Saga;
};

type ContextOptionalCallable<R, C extends Table.Context = Table.Context> = R | ((context: C) => R);

export type StoreConfig<
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> = {
  readonly tableId: TOrFn<string, [C]>;
  readonly footerRowSelectors?: ContextOptionalCallable<
    Partial<Table.FooterGridSet<Table.RowDataSelector<R>>>,
    C
  >;
  readonly reducer?: Redux.Reducer<S>;
  /*
	The table store selector can either be passed in as a configuration or
	in the props.  The preference is as a configuration, but there are cases
	where the selector depends on props of the parent component and needs
	to be passed in as a prop to the connected component.
	*/
  readonly selector?: (context: C) => (s: Application.Store) => S;
  /*
	The saga factory can either be passed in as a configuration or in the
	props.  The preference is as a configuration, but there are cases where the
	factory depends on props of the parent component and needs to be passed in
	as a prop to the connected component.
	*/
  readonly createSaga?: (t: Table.TableInstance<R, M>) => import("redux-saga").Saga;
};

type HOCProps<
  T extends ConnectedTableInjectedProps<R, S>,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> = Subtract<T, ConnectedTableInjectedProps<R, S>> & ConnectTableProps<R, M, C, S>;

type SelectorArg<
  T extends ConnectedTableInjectedProps<R, S>,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> = {
  readonly props: HOCProps<T, R, M, C, S>;
  readonly config: StoreConfig<R, M, C, S>;
};

const createAgnosticConfiguredSelector = <
  T extends ConnectedTableInjectedProps<R, S>,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  S extends Redux.TableStore<R>,
  C extends Table.Context = Table.Context,
>(
  d: SelectorArg<T, R, M, C, S>,
): ((s: Application.Store) => S) => {
  if (!isNil(d.props.selector)) {
    return d.props.selector;
  } else if (!isNil(d.config.selector)) {
    return d.config.selector(d.props.tableContext);
  }
  return () => redux.initialTableState as S;
};

const createConfiguredSelector = <
  RS,
  T extends ConnectedTableInjectedProps<R, S>,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>(
  sel: (s: S) => RS,
) =>
  createSelector(
    [(s: Application.Store) => s, (s: Application.Store, d: SelectorArg<T, R, M, C, S>) => d],
    (s: Application.Store, d: SelectorArg<T, R, M, C, S>) =>
      sel(createAgnosticConfiguredSelector(d)(s)),
  );

const connectTableToStore =
  <
    T extends ConnectedTableInjectedProps<R, S>,
    R extends Table.RowData,
    M extends Model.RowHttpModel,
    C extends Table.Context = Table.Context,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
  >(
    config: StoreConfig<R, M, C, S>,
  ) =>
  (Component: React.FunctionComponent<T>): React.FunctionComponent<HOCProps<T, R, M, C, S>> => {
    const selectSearch = createConfiguredSelector<string, T, R, M, C, S>((s: S) => s.search);
    const selectData = createConfiguredSelector<Table.BodyRow<R>[], T, R, M, C, S>(
      (s: S) => s.data,
    );
    const selectLoading = createConfiguredSelector<boolean, T, R, M, C, S>((s: S) => s.loading);

    const WithStoreConfigured = (props: HOCProps<T, R, M, C, S>) => {
      const store: Redux.Store<Application.Store> = useStore() as Redux.Store<Application.Store>;
      const data = useSelector((s: Application.Store) => selectData(s, { props, config }));
      const search = useSelector((s: Application.Store) => selectSearch(s, { props, config }));
      const loading = useSelector((s: Application.Store) => selectLoading(s, { props, config }));

      const [ready, setReady] = useState(false);
      const sagaInjected = useRef<boolean>(false);

      const agnosticSelector = useMemo(
        () => createAgnosticConfiguredSelector({ props, config }),
        [props.selector],
      );

      const tableId = useMemo(
        () =>
          typeof config.tableId === "string" ? config.tableId : config.tableId(props.tableContext),
        [props.tableContext],
      );

      /*
			It is extremely important that the ONLY dependency to this Saga is
			the `table` - if additional dependencies are added, it can lead to
			multiple Sagas being created for a given table... which means every
			action will make multiple requests to the backend API.*/

      useEffect(() => {
        const createSaga = config.createSaga || props.createSaga;
        if (!isNil(createSaga)) {
          if (sagaInjected.current === false) {
            if (!store.hasSaga(`${tableId}-saga`)) {
              const saga = createSaga(props.table.current);
              store.injectSaga(`${tableId}-saga`, saga);
            }
            sagaInjected.current = true;
            setReady(true);
            return () => {
              store.ejectSaga(`${tableId}-saga`);
            };
          }
        } else {
          setReady(true);
        }
      }, [props.table.current]);

      return (
        <Component
          {...(props as T & ConnectTableProps<R, M, C, S>)}
          tableId={tableId}
          search={search}
          /*
					This is necessary in order to not show stale data in a "flash" when
					the page initially loads and before the data in the store is
					updated.  The time between the stale data "flash" and the updated
					data is visible in the table is the time that it takes to inject
					the Saga.
					*/
          data={ready === true ? data : []}
          loading={loading}
          selector={agnosticSelector}
          footerRowSelectors={
            typeof config.footerRowSelectors === "function"
              ? config.footerRowSelectors?.(props.tableContext)
              : config.footerRowSelectors
          }
        />
      );
    };
    return hoistNonReactStatics(WithStoreConfigured, Component);
  };

export default connectTableToStore;

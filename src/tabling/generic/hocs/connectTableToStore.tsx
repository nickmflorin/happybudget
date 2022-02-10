import React, { useEffect, useState, useRef } from "react";
import { useStore, useSelector, useDispatch } from "react-redux";
import hoistNonReactStatics from "hoist-non-react-statics";
import { isNil } from "lodash";
import { redux } from "lib";

type ProvidedProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = {
  readonly search: string;
  readonly data: Table.BodyRow<R>[];
  readonly loading: boolean;
  readonly table: NonNullRef<Table.TableInstance<R, M>>;
  readonly footerRowSelectors?: Partial<Table.FooterGridSet<Table.RowDataSelector<R>>>;
  readonly selector: (state: Application.Store) => S;
  readonly onSearch: (v: string) => void;
  readonly onChangeEvent: (e: Table.ChangeEvent<R, M>) => void;
};

export type WithConnectedTableProps<
  T,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = T & ProvidedProps<R, M, S>;

const connectTableToStore =
  <
    T extends {
      readonly tableId: string;
      readonly table: NonNullRef<Table.TableInstance<R, M>>;
      readonly actionContext: C;
      readonly search?: string;
      readonly data?: Table.BodyRow<R>[];
      readonly loading?: boolean;
      /* The table store selector can either be passed in as a configuration or
         in the props.  The preference is as a configuration, but there are cases
         where the selector depends on props of the parent component and needs
         to be passed in as a prop to the connected component. */
      readonly selector?: (state: Application.Store) => S;
    },
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    C extends Table.Context = Table.Context
  >(
    config:
      | Table.StoreConfig<R, M, S, C, Redux.TableActionMap<M, C>>
      | Table.StoreConfig<R, M, S, C, Redux.AuthenticatedTableActionMap<R, M, C>>
  ) =>
  (
    Component:
      | React.ComponentClass<WithConnectedTableProps<T, R, M, S>, Record<string, unknown>>
      | React.FunctionComponent<WithConnectedTableProps<T, R, M, S>>
  ): React.FunctionComponent<T> => {
    let selector: (state: Application.Store) => S = () => redux.initialState.initialTableState as S;
    if (!isNil(config.selector)) {
      selector = config.selector;
    }
    const selectData = (state: Application.Store) => selector(state)?.data || [];
    const selectSearch = (state: Application.Store) => selector(state)?.search || "";
    const selectLoading = (state: Application.Store) => selector(state)?.loading || false;

    const _selectData = (s: Application.Store, p: T) => (isNil(p.selector) ? selectData(s) : p.selector(s).data);

    const WithStoreConfigured = (props: T) => {
      const store: Redux.Store<Application.Store> = useStore() as Redux.Store<Application.Store>;
      const data = useSelector((s: Application.Store) => _selectData(s, props));
      const search = useSelector(selectSearch);
      const loading = useSelector(selectLoading);

      const [ready, setReady] = useState(false);
      const sagaInjected = useRef<boolean>(false);

      const dispatch = useDispatch();

      /* It is extremely important that the ONLY dependency to this Saga is
				 the `tableId` - if additional dependencies are added, it can lead to
				 multiple Sagas being created for a given table... which means every
				 action will make multiple requests to the backend API. */
      useEffect(() => {
        if (!isNil(config.createSaga)) {
          if (sagaInjected.current === false) {
            if (!store.hasSaga(`${props.tableId}-saga`)) {
              const saga = config.createSaga(props.table.current);
              store.injectSaga(`${props.tableId}-saga`, saga);
            }
            sagaInjected.current = true;
            setReady(true);
            return () => {
              store.ejectSaga(`${props.tableId}-saga`);
            };
          }
        } else {
          setReady(true);
        }
      }, [props.tableId, props.table.current]);

      return (
        <Component
          search={search}
          /* This is necessary in order to not show stale data in a "flash" when
					 the page initially loads and before the data in the store is
					 updated.  The time between the stale data "flash" and the updated
					 data is visible in the table is the time that it takes to inject
					 the Saga. */
          data={ready === true ? data : []}
          loading={loading}
          selector={selector}
          {...props}
          footerRowSelectors={config.footerRowSelectors}
          onChangeEvent={(e: Table.ChangeEvent<R, M>) => {
            if ((config.actions as Redux.AuthenticatedTableActionMap<R, M, C>).tableChanged !== undefined) {
              dispatch(
                (config.actions as Redux.AuthenticatedTableActionMap<R, M, C>).tableChanged(e, props.actionContext)
              );
            }
          }}
          onSearch={(v: string) => dispatch(config.actions.setSearch(v, props.actionContext))}
        />
      );
    };
    return hoistNonReactStatics(WithStoreConfigured, Component);
  };

export default connectTableToStore;

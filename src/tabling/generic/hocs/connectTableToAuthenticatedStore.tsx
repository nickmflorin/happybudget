import React from "react";
import { useDispatch } from "react-redux";
import hoistNonReactStatics from "hoist-non-react-statics";
import { Subtract } from "utility-types";

import connectTableToStore, {
  StoreConfig,
  ConnectTableProps,
  ConnectedTableInjectedProps
} from "./connectTableToStore";

export type ConnectedAuthenticatedTableInjectedProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = ConnectedTableInjectedProps<R, S> & {
  readonly onEvent: (e: Table.Event<R, M>) => void;
  readonly onSearch: (v: string) => void;
};

export type ConnectAuthenticatedTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context
> = ConnectTableProps<R, M, S, C>;

type AuthenticatedStoreConfig<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context,
  A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
> = StoreConfig<R, M, S> & {
  readonly actions: Omit<A, "request">;
};

type HOCProps<
  T extends ConnectedAuthenticatedTableInjectedProps<R, M, S>,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  S extends Redux.TableStore<R>,
  C extends Table.Context = Table.Context
> = Subtract<T, ConnectedAuthenticatedTableInjectedProps<R, M, S>> & ConnectAuthenticatedTableProps<R, M, S, C>;

const connectTableToAuthenticatedStore =
  <
    T extends ConnectedAuthenticatedTableInjectedProps<R, M, S>,
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    C extends Table.Context = Table.Context,
    A extends Redux.AuthenticatedTableActionMap<R, M, C> = Redux.AuthenticatedTableActionMap<R, M, C>
  >(
    config: AuthenticatedStoreConfig<R, M, S, C, A>
  ) =>
  (Component: React.FunctionComponent<T>): React.FunctionComponent<HOCProps<T, R, M, S, C>> => {
    const ConnectedComponent = connectTableToStore<T, R, M, S, C>(config)(Component);
    const WithStoreConfigured = (props: HOCProps<T, R, M, S, C>) => {
      const dispatch = useDispatch();
      return (
        <ConnectedComponent
          {...(props as T & ConnectAuthenticatedTableProps<R, M, S, C>)}
          onSearch={(v: string) => dispatch(config.actions.setSearch(v, props.actionContext))}
          onEvent={(e: Table.Event<R, M>) => {
            dispatch(config.actions.tableChanged(e, props.actionContext));
          }}
        />
      );
    };
    return hoistNonReactStatics(WithStoreConfigured, Component);
  };

export default connectTableToAuthenticatedStore;

import React from "react";

import hoistNonReactStatics from "hoist-non-react-statics";
import { useDispatch } from "react-redux";
import { Subtract } from "utility-types";

import connectTableToStore, {
  StoreConfig,
  ConnectTableProps,
  ConnectedTableInjectedProps,
} from "./connectTableToStore";

export type ConnectedAuthenticatedTableInjectedProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> = ConnectedTableInjectedProps<R, S> & {
  readonly onEvent: (e: Table.Event<R, M>) => void;
  readonly onSearch: (v: string) => void;
};

export type ConnectAuthenticatedTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> = ConnectTableProps<R, M, C, S>;

type AuthenticatedStoreConfig<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  A extends Redux.AuthenticatedTableActionPayloadMap<
    R,
    M
  > = Redux.AuthenticatedTableActionPayloadMap<R, M>,
> = StoreConfig<R, M, C, S> & {
  readonly actions: Omit<Redux.ActionCreatorMap<A, C>, "request" | "invalidate">;
};

type HOCProps<
  T extends ConnectedAuthenticatedTableInjectedProps<R, M, S>,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> = Subtract<T, ConnectedAuthenticatedTableInjectedProps<R, M, S>> &
  ConnectAuthenticatedTableProps<R, M, C, S>;

const connectTableToAuthenticatedStore =
  <
    T extends ConnectedAuthenticatedTableInjectedProps<R, M, S>,
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    C extends Table.Context = Table.Context,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    A extends Redux.AuthenticatedTableActionPayloadMap<
      R,
      M
    > = Redux.AuthenticatedTableActionPayloadMap<R, M>,
  >(
    config: AuthenticatedStoreConfig<R, M, C, S, A>,
  ) =>
  (Component: React.FunctionComponent<T>): React.FunctionComponent<HOCProps<T, R, M, C, S>> => {
    const ConnectedComponent = connectTableToStore<T, R, M, C, S>(config)(Component);
    const WithStoreConfigured = (props: HOCProps<T, R, M, C, S>) => {
      const dispatch = useDispatch();
      return (
        <ConnectedComponent
          {...(props as T & ConnectAuthenticatedTableProps<R, M, C, S>)}
          onSearch={(v: string) => dispatch(config.actions.setSearch(v, props.tableContext))}
          onEvent={(e: Table.Event<R, M>) => {
            dispatch(config.actions.handleEvent(e, props.tableContext));
          }}
        />
      );
    };
    return hoistNonReactStatics(WithStoreConfigured, Component);
  };

export default connectTableToAuthenticatedStore;

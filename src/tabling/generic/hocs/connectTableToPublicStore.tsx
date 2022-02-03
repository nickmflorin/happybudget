import React from "react";
import { useDispatch } from "react-redux";
import hoistNonReactStatics from "hoist-non-react-statics";
import { Subtract } from "utility-types";

import connectTableToStore, {
  StoreConfig,
  ConnectTableProps,
  ConnectedTableInjectedProps
} from "./connectTableToStore";

export type ConnectedPublicTableInjectedProps<
  R extends Table.RowData,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = ConnectedTableInjectedProps<R, S> & {
  readonly onSearch: (v: string) => void;
};

export type ConnectPublicTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context
> = ConnectTableProps<R, M, S, C>;

type PublicStoreConfig<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  C extends Table.Context = Table.Context,
  A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>
> = StoreConfig<R, M, S> & {
  readonly actions: Omit<A, "request">;
};

type HOCProps<
  T extends ConnectedPublicTableInjectedProps<R, S>,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  S extends Redux.TableStore<R>,
  C extends Table.Context = Table.Context
> = Subtract<T, ConnectedPublicTableInjectedProps<R, S>> & ConnectPublicTableProps<R, M, S, C>;

const connectTableToPublicStore =
  <
    T extends ConnectedPublicTableInjectedProps<R, S>,
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    C extends Table.Context = Table.Context,
    A extends Redux.TableActionMap<M, C> = Redux.TableActionMap<M, C>
  >(
    config: PublicStoreConfig<R, M, S, C, A>
  ) =>
  (Component: React.FunctionComponent<T>): React.FunctionComponent<HOCProps<T, R, M, S, C>> => {
    const ConnectedComponent = connectTableToStore<T, R, M, S, C>(config)(Component);
    const WithStoreConfigured = (props: HOCProps<T, R, M, S, C>) => {
      const dispatch = useDispatch();
      return (
        <ConnectedComponent
          {...(props as T & ConnectPublicTableProps<R, M, S, C>)}
          onSearch={(v: string) => dispatch(config.actions.setSearch(v, props.actionContext))}
        />
      );
    };
    return hoistNonReactStatics(WithStoreConfigured, Component);
  };

export default connectTableToPublicStore;

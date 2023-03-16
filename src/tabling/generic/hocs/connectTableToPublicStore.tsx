import React from "react";

import hoistNonReactStatics from "hoist-non-react-statics";
import { useDispatch } from "react-redux";
import { Subtract } from "utility-types";

import connectTableToStore, {
  StoreConfig,
  ConnectTableProps,
  ConnectedTableInjectedProps,
} from "./connectTableToStore";

export type ConnectedPublicTableInjectedProps<
  R extends Table.RowData,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> = ConnectedTableInjectedProps<R, S> & {
  readonly onSearch: (v: string) => void;
};

export type ConnectPublicTableProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> = ConnectTableProps<R, M, C, S>;

type PublicStoreConfig<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  A extends Redux.TableActionPayloadMap<M> = Redux.TableActionPayloadMap<M>,
> = StoreConfig<R, M, C, S> & {
  readonly actions: Omit<Redux.ActionCreatorMap<A, C>, "request" | "invalidate">;
};

type HOCProps<
  T extends ConnectedPublicTableInjectedProps<R, S>,
  R extends Table.RowData,
  M extends Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> = Subtract<T, ConnectedPublicTableInjectedProps<R, S>> & ConnectPublicTableProps<R, M, C, S>;

const connectTableToPublicStore =
  <
    T extends ConnectedPublicTableInjectedProps<R, S>,
    R extends Table.RowData,
    M extends Model.RowHttpModel = Model.RowHttpModel,
    C extends Table.Context = Table.Context,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
    A extends Redux.TableActionPayloadMap<M> = Redux.TableActionPayloadMap<M>,
  >(
    config: PublicStoreConfig<R, M, C, S, A>,
  ) =>
  (Component: React.FunctionComponent<T>): React.FunctionComponent<HOCProps<T, R, M, C, S>> => {
    const ConnectedComponent = connectTableToStore<T, R, M, C, S>(config)(Component);
    const WithStoreConfigured = (props: HOCProps<T, R, M, C, S>) => {
      const dispatch = useDispatch();
      return (
        <ConnectedComponent
          {...(props as T & ConnectPublicTableProps<R, M, C, S>)}
          onSearch={(v: string) => dispatch(config.actions.setSearch(v, props.tableContext))}
        />
      );
    };
    return hoistNonReactStatics(WithStoreConfigured, Component);
  };

export default connectTableToPublicStore;

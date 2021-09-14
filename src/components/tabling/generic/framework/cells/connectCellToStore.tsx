import React from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil } from "lodash";
import hoistNonReactStatics from "hoist-non-react-statics";

/* eslint-disable indent */
const connectCellToStore = <
  R extends Table.RowData = any,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>,
  T extends Table.CellProps<R, M, G, S> = Table.CellProps<R, M, G, S>
>(
  Component: React.ComponentClass<T, {}> | React.FunctionComponent<T>
): React.FunctionComponent<T> => {
  const WithConnectedCell = (
    props: T & { readonly footerRowSelectors?: Partial<Table.FooterGridSet<Table.RowDataSelector<R>>> }
  ) => {
    let selectorFn: Table.RowDataSelector<R> | ((state: Application.Store) => null) = (state: Application.Store) =>
      null;
    if (props.gridId !== "data" && !isNil(props.footerRowSelectors)) {
      const fn: Table.RowDataSelector<R> | undefined = props.footerRowSelectors[props.gridId];
      if (!isNil(fn)) {
        selectorFn = fn;
      }
    }
    const valueSelector = createSelector([selectorFn], (v: Partial<R> | null) =>
      !isNil(v) && !isNil(props.customCol) ? v[props.customCol.field] : null
    );
    const value = useSelector(valueSelector);
    if (props.gridId === "data" || isNil(props.footerRowSelectors)) {
      return <Component {...props} />;
    }
    return <Component {...props} value={value} />;
  };
  return hoistNonReactStatics(WithConnectedCell, Component);
};

export default connectCellToStore;

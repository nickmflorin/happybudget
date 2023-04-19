import React from "react";

import { isNil } from "lodash";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";

const connectCellToStore = <
  T extends Table.ValueCellProps<R, M, C, S, V, CL>,
  R extends Table.RowData = Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  V extends string | number | null = string | number | null,
  CL extends Table.DataColumn<R, M, V> = Table.BodyColumn<R, M, V>,
>(
  Component: React.FunctionComponent<T>,
) => {
  const WithConnectedCell = (
    props: T & {
      readonly footerRowSelectors?: Partial<Table.FooterGridSet<Table.RowDataSelector<R>>>;
    },
  ): JSX.Element => {
    let selectorFn: Table.RowDataSelector<R> | ((state: Application.Store) => null) = () => null;
    if (props.gridId !== "data" && !isNil(props.footerRowSelectors)) {
      const fn: Table.RowDataSelector<R> | undefined = props.footerRowSelectors[props.gridId];
      if (!isNil(fn)) {
        selectorFn = fn;
      }
    }
    const valueSelector = createSelector([selectorFn], (v: Partial<R> | null) =>
      !isNil(v) && !isNil(props.customCol) ? v[props.customCol.field] : null,
    );
    const value = useSelector(valueSelector);
    if (props.gridId === "data" || isNil(props.footerRowSelectors)) {
      return <Component {...props} />;
    }
    return <Component {...props} value={value} />;
  };
  return React.memo(WithConnectedCell);
};

export default connectCellToStore;

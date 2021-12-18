import React from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { isNil } from "lodash";

const connectCellToStore = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
  T extends Table.CellProps<R, M, S> = Table.CellProps<R, M, S>
>(
  Component: React.ComponentClass<T, Record<string, unknown>> | React.FunctionComponent<T>
) => {
  const WithConnectedCell = (
    props: T & { readonly footerRowSelectors?: Partial<Table.FooterGridSet<Table.RowDataSelector<R>>> }
  ): JSX.Element => {
    let selectorFn: Table.RowDataSelector<R> | ((state: Application.Store) => null) = () => null;
    if (props.gridId !== "data" && !isNil(props.footerRowSelectors)) {
      const fn: Table.RowDataSelector<R> | undefined = props.footerRowSelectors[props.gridId];
      if (!isNil(fn)) {
        selectorFn = fn;
      }
    }
    const field = props.customCol.field || props.customCol.colId;
    const valueSelector = createSelector([selectorFn], (v: Partial<R> | null) =>
      !isNil(v) && !isNil(props.customCol) && !isNil(field) ? v[field as keyof R] : null
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

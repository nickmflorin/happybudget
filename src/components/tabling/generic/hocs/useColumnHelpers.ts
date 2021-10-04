import { useMemo } from "react";
import { isNil, find } from "lodash";

type CallWithColumn<R extends Table.RowData, M extends Model.HttpModel, RT extends any = any> = (
  field: keyof R | string,
  callback: (col: Table.Column<R, M>) => RT | null
) => void;

type UseColumnHelpersReturnType<R extends Table.RowData, M extends Model.HttpModel> = [
  (field: keyof R | string) => Table.Column<R, M> | null,
  CallWithColumn<R, M>
];

const useColumnHelpers = <R extends Table.RowData, M extends Model.HttpModel>(
  columns: Table.Column<R, M>[]
): UseColumnHelpersReturnType<R, M> => {
  const getColumn = useMemo(
    () =>
      (field: keyof R | string): Table.Column<R, M> | null => {
        const foundColumn = find(columns, (c: Table.Column<R, M>) => c.field === field || c.colId === field);
        if (!isNil(foundColumn)) {
          return foundColumn;
        } else {
          /* eslint-disable no-console */
          console.error(`Could not find column for field ${field}!`);
          return null;
        }
      },
    []
  );
  const callWithColumn = <RT extends any = any>(
    field: keyof R | string,
    callback: (col: Table.Column<R, M>) => RT | null
  ) => {
    const foundColumn = getColumn(field);
    return !isNil(foundColumn) ? callback(foundColumn) : null;
  };

  return [getColumn, callWithColumn];
};

export default useColumnHelpers;

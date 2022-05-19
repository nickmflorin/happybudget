import React, { useMemo } from "react";
import { isNil } from "lodash";

import { tabling } from "lib";

import BodyCell from "./BodyCell";
import connectCellToStore from "./connectCellToStore";

export type CalculatedCellProps<
  R extends Table.RowData = Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> = Table.ValueCellProps<R, M, S, number | null, Table.CalculatedColumn<R, M, number | null>> & {
  readonly hasInfo?:
    | boolean
    | ((cell: Table.CellConstruct<Table.ModelRow<R>, Table.CalculatedColumn<R, M>>) => boolean | undefined);
};

const CalculatedCell = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>({
  hasInfo,
  onInfoClicked,
  ...props
}: CalculatedCellProps<R, M, S>): JSX.Element => {
  const row: Table.ModelRow<R> | Table.FooterRow = props.node.data;

  const _hasInfo = useMemo(
    () =>
      tabling.rows.isModelRow(row)
        ? typeof hasInfo === "function"
          ? hasInfo({ row, col: props.customCol }) === true
          : hasInfo === true
        : false,
    [hasInfo, row, props.customCol]
  );

  if (tabling.rows.isModelRow(row) && !isNil(onInfoClicked) && _hasInfo) {
    return (
      <BodyCell<R, M, S, number | null, Table.CalculatedColumn<R, M, number | null>>
        {...props}
        onInfoClicked={onInfoClicked}
      />
    );
  }
  return <BodyCell<R, M, S, number | null, Table.CalculatedColumn<R, M, number | null>> {...props} />;
};

export default connectCellToStore<
  CalculatedCellProps<Table.RowData, Model.RowHttpModel, Redux.TableStore<Table.RowData>>,
  Table.RowData,
  Model.RowHttpModel,
  Redux.TableStore<Table.RowData>,
  number | null,
  Table.CalculatedColumn<Table.RowData, Model.RowHttpModel, number | null>
>(React.memo(CalculatedCell)) as typeof CalculatedCell;

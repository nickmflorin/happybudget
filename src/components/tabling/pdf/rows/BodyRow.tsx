import React from "react";

import classNames from "classnames";
import { includes, isNil } from "lodash";

import { BodyCell } from "../cells";
import { RowExplicitBodyCellProps } from "../cells/BodyCell";

import Row, { RowProps } from "./Row";

export interface BodyRowProps<
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  V extends Table.RawRowValue = Table.RawRowValue,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>,
> extends RowProps<R, M, V> {
  readonly fillBlank?: (c: Table.DataColumn<R, M, V>) => boolean;
  readonly row?: RW;
  readonly cellProps?: RowExplicitBodyCellProps<R, M, V>;
  readonly data: Table.BodyRow<R>[];
  /* Because we use columns to show multiple model types in the table (i.e.
     we use the SubAccount columns to show both Account(s) and SubAccount(s)),
     we need to avoid issuing warnings when the value for an model that is not
     applicable for the overall columns cannot be parsed. */
  readonly applicableColumns?: string[];
}

const BodyRow = <
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  V extends Table.RawRowValue = Table.RawRowValue,
  RW extends Table.BodyRow<R> = Table.BodyRow<R>,
>({
  cellProps,
  ...props
}: BodyRowProps<R, M, V, RW>): JSX.Element => (
  <Row<R, M, V>
    {...props}
    className={classNames("body-tr", props.className)}
    renderCell={(params: {
      lastChild: boolean;
      firstChild: boolean;
      column: Table.DataColumn<R, M, V>;
      indented: boolean;
      colIndex: number;
    }) => (
      <BodyCell<R, M, V>
        {...params}
        hideContent={
          !isNil(props.applicableColumns) && !includes(props.applicableColumns, params.column.field)
        }
        data={props.data}
        row={props.row}
        {...cellProps}
      />
    )}
  />
);

export default BodyRow;

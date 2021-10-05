import { useMemo } from "react";
import { reduce } from "lodash";
import classNames from "classnames";

import { tabling, util } from "lib";

import { CellProps } from "../Cells/Cell";
import HeaderCell from "../Cells/HeaderCell";
import Row, { RowProps } from "./Row";

const HeaderRow = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>({
  cellProps,
  ...props
}: Omit<RowProps<R, M>, "row"> & { readonly cellProps?: CellProps<R, M> }): JSX.Element => {
  const headerRow = useMemo(() => {
    return tabling.rows.createModelRow({
      id: util.generateRandomNumericId(),
      data: reduce(
        props.columns,
        (obj: { [key: string]: any }, col: Table.PdfColumn<R, M>) => {
          obj[col.field as string] = col.headerName;
          return obj;
        },
        {}
      ) as R
    });
  }, [props.columns]);
  return (
    <Row<R, M>
      {...props}
      className={classNames("header-tr", props.className)}
      row={headerRow}
      renderCell={(params: { column: Table.PdfColumn<R, M>; colIndex: number }) => {
        return (
          <HeaderCell<R, M>
            colIndex={params.colIndex}
            column={params.column}
            data={props.data}
            row={headerRow}
            {...cellProps}
          />
        );
      }}
    />
  );
};

export default HeaderRow;

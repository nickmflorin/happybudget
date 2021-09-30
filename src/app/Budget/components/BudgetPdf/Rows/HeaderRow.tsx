import { useMemo } from "react";
import { reduce } from "lodash";
import classNames from "classnames";

import { CellProps } from "../Cells/Cell";
import HeaderCell from "../Cells/HeaderCell";
import Row, { RowProps } from "./Row";

const HeaderRow = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>({
  cellProps,
  ...props
}: Omit<RowProps<R, M>, "row"> & { readonly cellProps?: CellProps<R, M> }): JSX.Element => {
  const headerRow = useMemo(() => {
    return reduce(
      props.columns,
      (obj: { [key: string]: any }, col: Table.PdfColumn<R, M>) => {
        obj[col.field as string] = col.headerName;
        return obj;
      },
      {}
    ) as Table.BodyRow<R>;
  }, [props.columns]);
  return (
    <Row<R, M>
      {...props}
      className={classNames("header-tr", props.className)}
      row={headerRow}
      renderCell={(params: { column: Table.PdfColumn<R, M>; location: Table.PdfCellLocation }) => {
        return (
          <HeaderCell<R, M>
            key={`header-${params.location.index}-${params.location.colIndex}`}
            location={params.location}
            column={params.column}
            row={headerRow}
            {...cellProps}
          />
        );
      }}
    />
  );
};

export default HeaderRow;

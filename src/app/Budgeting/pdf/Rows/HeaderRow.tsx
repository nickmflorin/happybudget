import { useMemo } from "react";
import { reduce } from "lodash";
import classNames from "classnames";

import { CellProps } from "../Cells/Cell";
import HeaderCell from "../Cells/HeaderCell";
import Row, { RowProps } from "./Row";

const HeaderRow = <R extends Table.PdfRow<C>, M extends Model.Model, C extends Model.Model>({
  cellProps,
  ...props
}: Omit<RowProps<R, M, C>, "row"> & { readonly cellProps?: CellProps<R, M, C> }): JSX.Element => {
  const headerRow = useMemo(() => {
    return reduce(
      props.columns,
      (obj: { [key: string]: any }, col: Table.PdfColumn<R, M, C>) => {
        obj[col.field] = col.headerName;
        return obj;
      },
      {}
    ) as R;
  }, [props.columns]);
  return (
    <Row
      {...props}
      className={classNames("header-tr", props.className)}
      row={headerRow}
      renderCell={(params: { column: Table.PdfColumn<R, M, C>; location: Table.PdfCellLocation }) => {
        return (
          <HeaderCell<R, M, C>
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

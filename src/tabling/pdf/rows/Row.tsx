import React, { useMemo } from "react";
import classNames from "classnames";
import { map, isNil, filter } from "lodash";
import { View } from "components/pdf";

export type RowProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
> = StandardPdfComponentProps & {
  readonly columns: C[];
  readonly columnIndent?: number;
  readonly columnIsVisible?: (c: C) => boolean;
};

const Row = <
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Column<R, M> = Table.Column<R, M>
>(
  props: RowProps<R, M, C> & {
    readonly renderCell: (params: {
      column: C;
      indented: boolean;
      colIndex: number;
      firstChild: boolean;
      lastChild: boolean;
    }) => JSX.Element;
  }
): JSX.Element => {
  const columnFilter = useMemo(() => {
    const visibleFilter = props.columnIsVisible;
    if (!isNil(visibleFilter)) {
      return (c: C) => c.tableColumnType !== "fake" && visibleFilter(c);
    }
    return (c: C) => c.tableColumnType !== "fake";
  }, [props.columnIsVisible]);

  return (
    <View style={props.style} className={classNames("tr", props.className)} wrap={false}>
      {map(filter(props.columns, columnFilter), (column: C, colIndex: number) => {
        return (
          <React.Fragment key={colIndex}>
            {props.renderCell({
              column,
              indented: !isNil(props.columnIndent) ? colIndex < props.columnIndent : false,
              colIndex,
              firstChild: colIndex === 0,
              lastChild: colIndex === filter(props.columns, columnFilter).length - 1
            })}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default Row;

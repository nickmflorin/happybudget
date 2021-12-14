import React, { useMemo } from "react";
import classNames from "classnames";
import { map, isNil, filter } from "lodash";
import { View } from "components/pdf";

export type RowProps<
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel
> = StandardPdfComponentProps & {
  readonly columns: Table.PdfColumn<R, M>[];
  readonly columnIndent?: number;
  readonly columnIsVisible?: (c: Table.PdfColumn<R, M>) => boolean;
};

/* eslint-disable indent */
const Row = <R extends Table.RowData, M extends Model.RowHttpModel = Model.RowHttpModel>(
  props: RowProps<R, M> & {
    readonly renderCell: (params: {
      column: Table.PdfColumn<R, M>;
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
      return (c: Table.PdfColumn<R, M>) => c.tableColumnType !== "fake" && visibleFilter(c);
    }
    return (c: Table.PdfColumn<R, M>) => c.tableColumnType !== "fake";
  }, [props.columnIsVisible]);

  return (
    <View style={props.style} className={classNames("tr", props.className)} wrap={false}>
      {map(filter(props.columns, columnFilter), (column: Table.PdfColumn<R, M>, colIndex: number) => {
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

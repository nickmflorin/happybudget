import React from "react";
import classNames from "classnames";
import { map, isNil } from "lodash";
import { View } from "components/pdf";

export type RowProps<
  R extends Table.RowData,
  M extends Model.HttpModel = Model.HttpModel
> = StandardPdfComponentProps & {
  readonly columns: Table.PdfColumn<R, M>[];
  readonly row: R;
  readonly columnIndent?: number;
};

const Row = <R extends Table.RowData, M extends Model.HttpModel = Model.HttpModel>(
  props: RowProps<R, M> & {
    readonly renderCell: (params: {
      column: Table.PdfColumn<R, M>;
      indented: boolean;
      colIndex: number;
    }) => JSX.Element;
  }
): JSX.Element => {
  return (
    <View style={props.style} className={classNames("tr", props.className)} wrap={false}>
      {map(props.columns, (column: Table.PdfColumn<R, M>, colIndex: number) => {
        return (
          <React.Fragment key={colIndex}>
            {props.renderCell({
              column,
              indented: !isNil(props.columnIndent) ? colIndex < props.columnIndent : false,
              colIndex
            })}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default Row;

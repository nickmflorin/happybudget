import classNames from "classnames";
import { map, isNil } from "lodash";
import { View } from "components/pdf";

export type RowProps<R extends Table.Row, M extends Model.Model> = StandardPdfComponentProps & {
  readonly columns: PdfTable.Column<R, M>[];
  readonly row: R;
  readonly index: number;
  readonly columnIndent?: number;
};

const Row = <R extends Table.Row, M extends Model.Model>(
  props: RowProps<R, M> & {
    readonly renderCell: (params: {
      column: PdfTable.Column<R, M>;
      indented: boolean;
      location: PdfTable.CellLocation;
    }) => JSX.Element;
  }
): JSX.Element => {
  return (
    <View style={props.style} className={classNames("tr", props.className)} wrap={false}>
      {map(props.columns, (column: PdfTable.Column<R, M>, colIndex: number) => {
        return props.renderCell({
          column,
          indented: !isNil(props.columnIndent) ? colIndex < props.columnIndent : false,
          location: { index: props.index, colIndex }
        });
      })}
    </View>
  );
};

export default Row;

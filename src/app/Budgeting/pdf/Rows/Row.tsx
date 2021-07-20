import classNames from "classnames";
import { map } from "lodash";
import { View } from "components/pdf";

export type RowProps<R extends PdfTable.Row, M extends Model.Model> = StandardPdfComponentProps & {
  readonly columns: PdfTable.Column<R, M>[];
  readonly row: R;
  readonly index: number;
};

const Row = <R extends PdfTable.Row, M extends Model.Model>(
  props: RowProps<R, M> & {
    readonly renderCell: (params: { column: PdfTable.Column<R, M>; location: PdfTable.CellLocation }) => JSX.Element;
  }
): JSX.Element => {
  return (
    <View style={props.style} className={classNames("tr", props.className)}>
      {map(props.columns, (column: PdfTable.Column<R, M>, colIndex: number) => {
        return props.renderCell({ column, location: { index: props.index, colIndex } });
      })}
    </View>
  );
};

export default Row;

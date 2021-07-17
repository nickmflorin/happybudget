import classNames from "classnames";
import { map } from "lodash";
import { View } from "components/pdf";

export type RowProps<R extends Table.PdfRow, M extends Model.Model> = StandardPdfComponentProps & {
  readonly columns: Table.PdfColumn<R, M>[];
  readonly row: R;
  readonly index: number;
};

const Row = <R extends Table.PdfRow, M extends Model.Model>(
  props: RowProps<R, M> & {
    readonly renderCell: (params: { column: Table.PdfColumn<R, M>; location: Table.PdfCellLocation }) => JSX.Element;
  }
): JSX.Element => {
  return (
    <View style={props.style} className={classNames("tr", props.className)}>
      {map(props.columns, (column: Table.PdfColumn<R, M>, colIndex: number) => {
        return props.renderCell({ column, location: { index: props.index, colIndex } });
      })}
    </View>
  );
};

export default Row;

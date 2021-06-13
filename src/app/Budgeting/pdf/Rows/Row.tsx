import classNames from "classnames";
import { map } from "lodash";
import { View } from "../Base";

export type RowProps<
  R extends Table.PdfRow<C>,
  M extends Model.Model,
  C extends Model.Model
> = StandardPdfComponentProps & {
  readonly columns: Table.PdfColumn<R, M, C>[];
  readonly row: R;
  readonly index: number;
};

const Row = <R extends Table.PdfRow<C>, M extends Model.Model, C extends Model.Model>(
  props: RowProps<R, M, C> & {
    readonly renderCell: (params: { column: Table.PdfColumn<R, M, C>; location: Table.PdfCellLocation }) => JSX.Element;
  }
): JSX.Element => {
  return (
    <View style={props.style} className={classNames("tr", props.className)}>
      {map(props.columns, (column: Table.PdfColumn<R, M, C>, colIndex: number) => {
        return props.renderCell({ column, location: { index: props.index, colIndex } });
      })}
    </View>
  );
};

export default Row;

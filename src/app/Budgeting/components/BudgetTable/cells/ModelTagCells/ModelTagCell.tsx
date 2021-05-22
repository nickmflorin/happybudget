import { isNil } from "lodash";
import { Tag } from "components/tagging";
import Cell, { StandardCellProps } from "../Cell";

export interface ModelTagCellProps<M extends Model.Model, R extends Table.Row> extends StandardCellProps<R> {
  readonly value: M | null;
  readonly leftAlign?: boolean;
}

const ModelTagCell = <M extends Model.Model, R extends Table.Row>({
  value,
  leftAlign,
  ...props
}: ModelTagCellProps<M, R>): JSX.Element => {
  return (
    <Cell {...props} onClear={() => props.setValue(null)} hideClear={value === null}>
      <div style={{ display: "flex", justifyContent: leftAlign === true ? "left" : "center" }}>
        {!isNil(value) ? <Tag model={value} /> : <Tag.Empty visible={false} />}
      </div>
    </Cell>
  );
};

export default ModelTagCell;

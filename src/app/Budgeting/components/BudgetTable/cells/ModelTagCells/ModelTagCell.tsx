import { isNil } from "lodash";
import { Tag } from "components/tagging";
import Cell, { StandardCellProps } from "../Cell";

export interface ModelTagCellProps<M extends Model.Model, R extends Table.Row> extends StandardCellProps<R> {
  value: M | null;
}

const ModelTagCell = <M extends Model.Model, R extends Table.Row>(props: ModelTagCellProps<M, R>): JSX.Element => {
  return (
    <Cell {...props} onClear={() => props.setValue(null)} hideClear={props.value === null}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        {!isNil(props.value) ? <Tag model={props.value} /> : <Tag.Empty visible={false} />}
      </div>
    </Cell>
  );
};

export default ModelTagCell;

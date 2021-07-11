import { isNil } from "lodash";
import { Tag } from "components/tagging";
import Cell, { StandardCellProps } from "../Cell";

export interface ModelTagCellProps<M extends Model.Model> extends StandardCellProps {
  readonly children: M | null;
  readonly leftAlign?: boolean;
}

const ModelTagCell = <M extends Model.Model>({ children, leftAlign, ...props }: ModelTagCellProps<M>): JSX.Element => {
  return (
    <Cell {...props} onClear={() => !isNil(props.setValue) && props.setValue(null)} hideClear={children === null}>
      <div style={{ display: "flex", justifyContent: leftAlign === true ? "left" : "center" }}>
        {!isNil(children) ? <Tag model={children} /> : <></>}
      </div>
    </Cell>
  );
};

export default ModelTagCell;

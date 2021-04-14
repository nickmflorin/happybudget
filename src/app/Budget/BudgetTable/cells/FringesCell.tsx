import { useSelector } from "react-redux";
import { map } from "lodash";

import { ModelTagsDropdown } from "components/dropdowns";
import { selectFringes } from "../../store/selectors";
import Cell, { StandardCellProps } from "./Cell";

interface FringesCellProps extends StandardCellProps<Table.SubAccountRow> {
  value: number[];
}

const FringesCell = ({ value, ...props }: FringesCellProps): JSX.Element => {
  // I am not 100% sure that this will properly update the AG Grid component when
  // the fringes in the state change.
  const fringes = useSelector(selectFringes);

  const row: Table.SubAccountRow = props.node.data;

  return (
    <Cell {...props} onClear={() => props.setValue([])} hideClear={value.length === 0}>
      <ModelTagsDropdown<Model.Fringe>
        overlayClassName={"cell-dropdown"}
        value={value}
        models={fringes}
        labelField={"name"}
        multiple={true}
        selected={row.fringes}
        onChange={(fs: Model.Fringe[]) => props.setValue(map(fs, (f: Model.Fringe) => f.id))}
      />
    </Cell>
  );
};

export default FringesCell;

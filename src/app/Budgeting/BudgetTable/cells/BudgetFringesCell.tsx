import { useSelector } from "react-redux";
import { map } from "lodash";

import { ModelTagsDropdown } from "components/dropdowns";
import { selectBudgetFringes } from "../../store/selectors";
import Cell, { StandardCellProps } from "./Cell";

interface BudgetFringesCellProps extends StandardCellProps<Table.BudgetSubAccountRow> {
  value: number[];
}

const BudgetFringesCell = ({ value, ...props }: BudgetFringesCellProps): JSX.Element => {
  // I am not 100% sure that this will properly update the AG Grid component when
  // the fringes in the state change.
  const fringes = useSelector(selectBudgetFringes);

  const row: Table.BudgetSubAccountRow = props.node.data;

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

export default BudgetFringesCell;

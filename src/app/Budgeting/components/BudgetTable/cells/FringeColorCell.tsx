import { useSelector } from "react-redux";
import { ColorDropdown } from "components/dropdowns";
import Cell, { StandardCellProps } from "./Cell";
import { selectFringeColors } from "../../../store/selectors";

interface FringeColorCellProps extends StandardCellProps<Table.BudgetSubAccountRow> {
  value: string | null;
}

const FringeColorCell = ({ value, ...props }: FringeColorCellProps): JSX.Element => {
  const colors = useSelector(selectFringeColors);
  console.log(value);
  return (
    <Cell {...props}>
      <ColorDropdown colors={colors} value={value} onChange={(color: string) => props.setValue(color)} />
    </Cell>
  );
};

export default FringeColorCell;

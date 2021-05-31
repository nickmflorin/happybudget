import { Color } from "components/tagging";
import Cell, { StandardCellProps } from "./Cell";

interface ColorCellProps extends StandardCellProps<any> {
  value: string | null;
}

const ColorCell = ({ value, ...props }: ColorCellProps): JSX.Element => {
  return (
    <Cell {...props}>
      <Color color={value} />
    </Cell>
  );
};

export default ColorCell;

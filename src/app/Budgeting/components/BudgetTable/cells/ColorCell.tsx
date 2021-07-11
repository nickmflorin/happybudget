import { Color } from "components/tagging";
import Cell, { StandardCellProps } from "./Cell";

interface ColorCellProps extends StandardCellProps {
  children: string | null;
}

const ColorCell = ({ children, ...props }: ColorCellProps): JSX.Element => {
  return (
    <Cell {...props}>
      <Color color={children} />
    </Cell>
  );
};

export default ColorCell;

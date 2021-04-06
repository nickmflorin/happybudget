import { useSelector } from "react-redux";
import { map } from "lodash";

import { ModelTagsDropdown } from "components/control/dropdowns";
import { selectFringes } from "../../store/selectors";
import Cell, { StandardCellProps } from "./Cell";

interface FringesCellProps extends StandardCellProps<Table.SubAccountRow> {
  onChange: (ids: number[], row: Table.SubAccountRow) => void;
}

const FringesCell = ({ value, onChange, ...props }: FringesCellProps): JSX.Element => {
  // I am not 100% sure that this will properly update the AG Grid component when
  // the fringes in the state change.
  const fringes = useSelector(selectFringes);

  const row: Table.SubAccountRow = props.node.data;

  return (
    <Cell {...props}>
      <ModelTagsDropdown<IFringe>
        overlayClassName={"cell-dropdown"}
        value={value}
        models={fringes}
        labelField={"name"}
        multiple={true}
        selected={row.fringes}
        onChange={(fs: IFringe[]) =>
          onChange(
            map(fs, (f: IFringe) => f.id),
            props.node.data
          )
        }
      />
    </Cell>
  );
};

export default FringesCell;

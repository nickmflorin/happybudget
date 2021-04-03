import { useSelector } from "react-redux";
import { map } from "lodash";
import { ICellRendererParams, RowNode } from "ag-grid-community";

import { ModelTagsDropdown } from "components/control/dropdowns";

import { simpleDeepEqualSelector } from "store/selectors";

const selectFringes = simpleDeepEqualSelector((state: Redux.IApplicationStore) => state.budget.fringes.data);

interface PaymentMethodCellProps extends ICellRendererParams {
  onChange: (ids: number[], row: Table.ActualRow) => void;
  value: number[];
  node: RowNode;
}

const FringesCell = ({ value, node, onChange }: PaymentMethodCellProps): JSX.Element => {
  // I am not 100% sure that this will properly update the AG Grid component when
  // the fringes in the state change.
  const fringes = useSelector(selectFringes);

  const row: Table.SubAccountRow = node.data;
  return (
    <ModelTagsDropdown<IFringe>
      value={value}
      models={fringes}
      labelField={"name"}
      multiple={true}
      defaultSelected={row.fringes}
      onChange={(fs: IFringe[]) =>
        onChange(
          map(fs, (f: IFringe) => f.id),
          node.data
        )
      }
    />
  );
};

export default FringesCell;

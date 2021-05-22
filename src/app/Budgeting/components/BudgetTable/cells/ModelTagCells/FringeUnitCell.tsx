import ModelTagCell, { ModelTagCellProps } from "./ModelTagCell";

const FringeUnitCell = (props: ModelTagCellProps<Model.FringeUnit, Table.BudgetSubAccountRow>): JSX.Element => (
  <ModelTagCell {...props} leftAlign={true} />
);
export default FringeUnitCell;

import ModelTagCell, { ModelTagCellProps } from "./ModelTagCell";

const SubAccountUnitCell = (props: ModelTagCellProps<Model.SubAccountUnit, Table.BudgetSubAccountRow>): JSX.Element => (
  <ModelTagCell {...props} leftAlign={true} />
);
export default SubAccountUnitCell;

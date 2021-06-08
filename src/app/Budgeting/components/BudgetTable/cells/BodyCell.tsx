import ValueCell, { ValueCellProps } from "./ValueCell";

export interface BodyCellProps<R extends Table.Row> extends ValueCellProps<R> {
  children: any;
}

const BodyCell = <R extends Table.Row>({ ...props }: BodyCellProps<R>): JSX.Element => {
  return <ValueCell<R> {...props}>{props.children}</ValueCell>;
};

export default BodyCell;

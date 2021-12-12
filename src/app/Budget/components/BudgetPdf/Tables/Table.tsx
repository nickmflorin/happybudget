import classNames from "classnames";
import { View } from "components/pdf";

interface TableProps extends StandardPdfComponentProps {
  readonly children: JSX.Element[] | JSX.Element;
}

const Table = ({ ...props }: TableProps): JSX.Element => {
  return <View className={classNames(props.className, "table")}>{props.children}</View>;
};

export default Table;

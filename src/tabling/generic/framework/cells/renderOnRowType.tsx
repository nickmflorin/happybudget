import React from "react";
import { isNil } from "lodash";

type RowTypeRender<T extends { node: Table.RowNode } = { node: Table.RowNode }> = Partial<{
  [key in Table.RowType | "default"]: React.ComponentClass<T, Record<string, unknown>> | React.FunctionComponent<T>;
}>;

const renderOnRowType = <
  T extends { node: Table.RowNode } = { node: Table.RowNode },
  R extends Table.RowData = Table.RowData
>(
  lookup: RowTypeRender<T>
) => {
  const WithRowsOfType = (props: T) => {
    const row: Table.BodyRow<R> = props.node.data;
    let Component: React.ComponentClass<T, Record<string, unknown>> | React.FunctionComponent<T> | undefined =
      lookup[row.rowType];
    if (isNil(Component)) {
      Component = lookup["default"];
    }
    if (!isNil(Component)) {
      return <Component {...props} />;
    }
    return <span></span>;
  };
  return React.memo(WithRowsOfType);
};

export default renderOnRowType;

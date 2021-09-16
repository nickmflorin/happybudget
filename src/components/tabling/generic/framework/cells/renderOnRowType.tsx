import React from "react";
import { isNil } from "lodash";

/* eslint-disable no-unused-vars */
type RowTypeRender<T extends { node: Table.RowNode } = any> = Partial<
  {
    [key in Table.RowType | "default"]: React.ComponentClass<T, {}> | React.FunctionComponent<T>;
  }
>;

/* eslint-disable indent */
const renderOnRowType = <T extends { node: Table.RowNode } = any, R extends Table.RowData = object>(
  lookup: RowTypeRender<T>
) => {
  const WithRowsOfType = (props: T) => {
    const row: Table.Row<R> = props.node.data;
    let Component: React.ComponentClass<T, {}> | React.FunctionComponent<T> | undefined = lookup[row.rowType];
    if (isNil(Component)) {
      Component = lookup["default"];
    }
    if (!isNil(Component)) {
      return <Component {...props} />;
    }
    return <span></span>;
  };
  return WithRowsOfType;
};

export default renderOnRowType;

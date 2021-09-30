import React from "react";
import { includes } from "lodash";
import hoistNonReactStatics from "hoist-non-react-statics";

/* eslint-disable indent */
const excludeRowsOfType =
  <T extends { node: Table.RowNode } = any, R extends Table.RowData = object>(types: Table.RowType[] | Table.RowType) =>
  (Component: React.ComponentClass<T, {}> | React.FunctionComponent<T>): React.FunctionComponent<T> => {
    const typesToExclude = Array.isArray(types) ? types : [types];
    const WithExcludeRowsOfType = (props: T) => {
      const row: Table.BodyRow<R> = props.node.data;
      if (includes(typesToExclude, row.rowType)) {
        return <span></span>;
      }
      return <Component {...props} />;
    };
    return hoistNonReactStatics(WithExcludeRowsOfType, Component);
  };

export default excludeRowsOfType;

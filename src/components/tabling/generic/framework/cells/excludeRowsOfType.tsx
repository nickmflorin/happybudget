import React from "react";

import { includes } from "lodash";

/* eslint-disable @typescript-eslint/no-explicit-any */
const excludeRowsOfType =
  <T extends { node: Table.RowNode } = { node: Table.RowNode }, R extends Table.RowData = any>(
    types: Table.RowType[] | Table.RowType,
  ) =>
  /* eslint-disable @typescript-eslint/no-explicit-any */
  (Component: React.FunctionComponent<any>) => {
    const typesToExclude = Array.isArray(types) ? types : [types];
    const WithExcludeRowsOfType = (props: T): JSX.Element => {
      const row: Table.BodyRow<R> = props.node.data;
      if (includes(typesToExclude, row.rowType)) {
        return <span></span>;
      }
      return <Component {...props} />;
    };
    return React.memo(WithExcludeRowsOfType);
  };

export default excludeRowsOfType;

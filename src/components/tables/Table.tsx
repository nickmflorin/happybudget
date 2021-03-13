import React from "react";

import { Table as AntdTable } from "antd";

import TableProvider from "./TableProvider";

interface TableProps {
  emptyDescription?: string;
  [key: string]: any;
}

const Table = ({ emptyDescription, ...props }: TableProps): JSX.Element => {
  return (
    <TableProvider emptyDescription={emptyDescription}>
      <AntdTable {...props} />
    </TableProvider>
  );
};

export default Table;

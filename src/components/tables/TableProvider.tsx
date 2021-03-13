import React from "react";

import { ConfigProvider, Empty } from "antd";

interface TableProviderProps {
  children: JSX.Element;
  emptyDescription?: string;
  [key: string]: any;
}

const TableProvider = ({ children, emptyDescription, ...props }: TableProviderProps): JSX.Element => {
  return (
    <ConfigProvider renderEmpty={() => <Empty className={"empty"} description={emptyDescription} />} {...props}>
      {children}
    </ConfigProvider>
  );
};

export default TableProvider;

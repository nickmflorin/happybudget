import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { isNil } from "lodash";
import { Space, Button } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";

import { ShowHide } from "components/display";

import "./ToggleSortBy.scss";

interface ToggleSortByProps {
  title: string;
  // Whether or not the sortOrder is explicitly provided determines whether or
  // not the component is controlled or uncontrolled.
  order?: Order;
  onChange: (order: Order) => void;
  defaultOrder?: Order;
  style?: React.CSSProperties;
  className?: string;
}

const ToggleSortBy = ({
  title,
  order,
  defaultOrder = 0,
  style = {},
  className,
  onChange
}: ToggleSortByProps): JSX.Element => {
  // We maintain the order as state of this component so that it can be both
  // a controlled and an uncontrolled component.
  const [_order, setOrder] = useState<Order>(defaultOrder);

  useEffect(() => {
    if (!isNil(order)) {
      setOrder(order);
    }
  }, [order]);

  return (
    <Space className={classNames("toggle-sort-by", className)} style={style} size={"small"}>
      <Button
        className={"btn--link"}
        onClick={() => {
          setOrder(order === -1 || order === 0 ? 1 : -1);
          onChange(order === -1 || order === 0 ? 1 : -1);
        }}
      >
        {title}
      </Button>
      <div style={{ width: 20 }}>
        <ShowHide show={_order === 1}>
          <ArrowUpOutlined />
        </ShowHide>
        <ShowHide show={_order === -1}>
          <ArrowDownOutlined />
        </ShowHide>
      </div>
    </Space>
  );
};

export default ToggleSortBy;

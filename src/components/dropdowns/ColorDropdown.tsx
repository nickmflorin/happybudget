import React from "react";
import classNames from "classnames";

import { Color } from "components/tagging";
import { ColorSelect } from "components/fields";

import Dropdown, { DropdownProps } from "./Dropdown";

import "./ColorDropdown.scss";

type ColorDropdownProps = Omit<DropdownProps, "overlay" | "items" | "children"> &
  StandardComponentProps & {
    readonly colors: string[];
    readonly value?: string | null;
    readonly onChange: (value: string) => void;
  };

const ColorDropdown = ({
  /* eslint-disable indent */
  value,
  colors,
  className,
  onChange,
  ...props
}: ColorDropdownProps): JSX.Element => {
  return (
    <Dropdown
      overlayClassName={classNames("color-dropdown", className)}
      overlay={<ColorSelect colors={colors} value={value} onChange={onChange} />}
      {...props}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Color color={value} />
      </div>
    </Dropdown>
  );
};

export default React.memo(ColorDropdown);

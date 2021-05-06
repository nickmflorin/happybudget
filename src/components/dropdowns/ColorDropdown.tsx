import classNames from "classnames";

import { Dropdown, Color } from "components";
import { DropdownProps } from "components/Dropdown";
import { ColorSelect } from "components/forms";

import "./ColorDropdown.scss";

type ColorDropdownProps = Omit<DropdownProps, "overlay" | "items" | "children"> & {
  colors: string[];
  value?: string | null;
  className?: string;
  onChange: (value: string) => void;
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

export default ColorDropdown;
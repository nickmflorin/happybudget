import classNames from "classnames";

import { Dropdown } from "components";
import { Color } from "components/tagging";
import { DropdownProps } from "components/dropdowns/Dropdown";
import { ColorSelect } from "components/forms/fields";

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

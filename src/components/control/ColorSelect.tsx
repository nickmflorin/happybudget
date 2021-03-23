import { map } from "lodash";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircle } from "@fortawesome/free-solid-svg-icons";

import { Select } from "antd";
import { SelectProps } from "antd/lib/select";

import "./ColorSelect.scss";

interface ColorSelectProps extends SelectProps<string>, StandardComponentProps {
  colors: string[];
}

const ColorSelect = ({ className, style = {}, colors, ...props }: ColorSelectProps): JSX.Element => {
  return (
    <Select
      className={classNames("select--color", className)}
      placeholder={props.placeholder || "Color"}
      optionLabelProp={"label"}
      style={style}
      {...props}
    >
      {map(colors, (color: string) => {
        return (
          <Select.Option value={color} label={"color"}>
            <div className={"option-label-item"}>
              <span role={"img"} aria-label={"color"}>
                <FontAwesomeIcon icon={faCircle} style={{ color }} />
              </span>
              {color}
            </div>
          </Select.Option>
        );
      })}
    </Select>
  );
};

export default ColorSelect;

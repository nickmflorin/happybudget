import { map, isNil } from "lodash";
import { TooltipPropsWithTitle } from "antd/lib/tooltip";

import { IconButton } from "components/control/buttons";

import "./Toolbar.scss";

export interface IToolbarItem {
  icon: JSX.Element;
  to?: string;
  // TODO: Implement activity of IconButton.
  active?: boolean;
  activePathRegexes?: RegExp[];
  // TODO: Implement Tooltip Wrapper.
  tooltip?: TooltipPropsWithTitle;
  onClick?: () => void;
  disabled?: boolean;
}

interface ToolbarProps {
  items: IToolbarItem[];
}

const Toolbar = ({ items }: ToolbarProps): JSX.Element => {
  return (
    <div className={"toolbar"}>
      {map(items, (item: IToolbarItem) => {
        return (
          <IconButton
            className={"dark"}
            size={"small"}
            icon={item.icon}
            disabled={item.disabled}
            onClick={() => {
              if (!isNil(item.onClick)) {
                item.onClick();
              }
            }}
          />
        );
      })}
    </div>
  );
};

export default Toolbar;

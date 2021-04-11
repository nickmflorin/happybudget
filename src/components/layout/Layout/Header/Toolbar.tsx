import { map, isNil } from "lodash";
import { TooltipPropsWithTitle } from "antd/lib/tooltip";

import { IconButton } from "components/buttons";

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
  role?: string;
}

interface ToolbarProps {
  items: IToolbarItem[];
}

const Toolbar = ({ items }: ToolbarProps): JSX.Element => {
  return (
    <div className={"toolbar"}>
      {map(items, (item: IToolbarItem, index: number) => {
        return (
          <IconButton
            className={"dark"}
            role={item.role}
            key={index}
            size={"large"}
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

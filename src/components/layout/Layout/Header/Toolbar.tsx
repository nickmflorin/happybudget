import { map, isNil } from "lodash";
import { TooltipPropsWithTitle } from "antd/lib/tooltip";

import { VerticalFlexCenter } from "components";
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
          <VerticalFlexCenter key={index}>
            <IconButton
              tooltip={item.tooltip}
              className={"dark"}
              role={item.role}
              size={"large"}
              icon={item.icon}
              disabled={item.disabled}
              onClick={() => {
                if (!isNil(item.onClick)) {
                  item.onClick();
                }
              }}
            />
          </VerticalFlexCenter>
        );
      })}
    </div>
  );
};

export default Toolbar;

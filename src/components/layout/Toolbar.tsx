import { map } from "lodash";
import { TooltipPropsWithTitle } from "antd/lib/tooltip";

import "./Toolbar.scss";

export interface IToolbarItem {
  icon: JSX.Element;
  to?: string;
  active?: boolean;
  activePathRegexes?: RegExp[];
  tooltip?: TooltipPropsWithTitle;
  onClick?: () => void;
}

interface ToolbarProps {
  items: IToolbarItem[];
}

const Toolbar = ({ items }: ToolbarProps): JSX.Element => {
  return (
    <div className={"toolbar"}>
      {map(items, (item: IToolbarItem) => {
        return <div className={"toolbar-item"}>{item.icon}</div>;
      })}
    </div>
  );
};

export default Toolbar;

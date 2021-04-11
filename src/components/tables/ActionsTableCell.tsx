import React, { ReactNode } from "react";
import { map, isNil } from "lodash";
import { Tooltip, Divider } from "antd";
import { IconButton } from "components/buttons";
import { IconRouterLink } from "components/links";

export interface ITableCellAction {
  tooltip?: string;
  icon: ReactNode;
  onClick?: () => void;
  to?: any;
  style?: React.CSSProperties;
  visible?: boolean;
  dividerAfter?: boolean;
  spaceIfInvisible?: boolean;
}

interface ActionsTableCellActionProps {
  action: ITableCellAction;
}

const ActionsTableCellAction = ({ action }: ActionsTableCellActionProps): JSX.Element => {
  if (!(action.visible === false)) {
    if (!isNil(action.onClick)) {
      if (!isNil(action.tooltip)) {
        return (
          <Tooltip title={action.tooltip}>
            <IconButton onClick={action.onClick} icon={action.icon} style={action.style} />
          </Tooltip>
        );
      }
      return <IconButton onClick={action.onClick} icon={action.icon} style={action.style} />;
    } else if (!isNil(action.to)) {
      if (!isNil(action.tooltip)) {
        return (
          <Tooltip title={action.tooltip}>
            <IconRouterLink style={action.style} icon={action.icon} to={action.to} />
          </Tooltip>
        );
      }
      return <IconRouterLink style={action.style} icon={action.icon} to={action.to} />;
    } else {
      return <React.Fragment></React.Fragment>;
    }
  } else if (action.spaceIfInvisible === true) {
    return <div style={{ height: 28, width: 28 }}></div>;
  }
  return <React.Fragment></React.Fragment>;
};

interface ActionsTableCellProps {
  actions: ITableCellAction[];
  withDividers?: boolean;
}

const ActionsTableCell = ({ actions, withDividers = true }: ActionsTableCellProps): JSX.Element => {
  const insertDivider = (action: ITableCellAction, index: number): JSX.Element => {
    if (index === actions.length - 1 || withDividers === false || action.dividerAfter === false) {
      return <></>;
    } else if (action.visible === false) {
      if (action.spaceIfInvisible === true && index !== actions.length - 1) {
        return <Divider type={"vertical"} style={{ height: "auto" }} />;
      }
      return <></>;
    } else if (actions[index + 1].visible === false && actions[index + 1].spaceIfInvisible === true) {
      return <Divider type={"vertical"} style={{ height: "auto", opacity: 0 }} />;
    }
    return <Divider type={"vertical"} style={{ height: "auto" }} />;
  };
  return (
    <div className={"actions-table-cell"}>
      {map(actions, (action: ITableCellAction, index: number) => {
        if (!isNil(action.onClick) || !isNil(action.to)) {
          return (
            <React.Fragment key={index}>
              <ActionsTableCellAction action={action} />
              {insertDivider(action, index)}
            </React.Fragment>
          );
        }
        return <React.Fragment key={index}></React.Fragment>;
      })}
    </div>
  );
};

export default ActionsTableCell;

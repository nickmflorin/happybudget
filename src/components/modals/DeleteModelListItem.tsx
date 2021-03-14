import React, { ReactNode } from "react";
import { isNil } from "lodash";
import { Checkbox } from "antd";
import { ShowHide } from "components/display";

import "./DeleteModelListItem.scss";

export interface DeleteModelListItemProps {
  text: string;
  checked?: boolean;
  onToggle?: () => void;
  icon?: ReactNode;
  checkable?: boolean;
}

const DeleteModelListItem = ({
  text,
  icon,
  checked,
  onToggle,
  checkable = true
}: DeleteModelListItemProps): JSX.Element => {
  return (
    <div
      className={"delete-model-list-item"}
      onClick={(event: React.MouseEvent<HTMLDivElement>) => {
        if (!isNil(onToggle)) {
          onToggle();
        }
      }}
    >
      <ShowHide show={checkable}>
        <div className={"checkbox-container"}>
          <Checkbox checked={checked} defaultChecked={true} />
        </div>
      </ShowHide>
      <ShowHide show={!isNil(icon)}>
        <div className={"icon-container"}>{icon}</div>
      </ShowHide>
      <div className={"text-container"}>
        <p>{text}</p>
      </div>
    </div>
  );
};

export default DeleteModelListItem;

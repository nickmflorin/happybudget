import React from "react";
import classNames from "classnames";

import { ShowHide } from "components";

import FileIcon from "./FileIcon";
import "./AttachmentText.scss";

export interface AttachmentTextProps extends StandardComponentProps {
  readonly children: Model.Attachment;
  readonly showSize?: boolean;
}

const AttachmentText: React.FC<AttachmentTextProps> = ({ children, showSize, ...props }) => {
  return (
    <span {...props} className={classNames("attachment-text", props.className)}>
      <FileIcon className={"icon--attachment-text"} name={children.name} ext={children.extension} />
      <span className={"file-name"}>{children.name}</span>
      <ShowHide show={showSize}>
        <span className={"file-size"}>{children.name}</span>
      </ShowHide>
    </span>
  );
};

export default AttachmentText;

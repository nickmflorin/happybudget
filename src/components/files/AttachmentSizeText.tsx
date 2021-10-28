import React from "react";
import classNames from "classnames";

import { util } from "lib";
import { Icon } from "components";

import "./AttachmentText.scss";

export interface AttachmentTextProps extends StandardComponentProps {
  readonly children: Model.Attachment;
}

const AttachmentText: React.FC<AttachmentTextProps> = ({ children, ...props }) => {
  return (
    <div {...props} className={classNames("attachment-text", "attachment-size-text", props.className)}>
      <div className={"content-text"}>{util.files.fileSizeString(children.size)}</div>
      <div className={"icon-wrapper"} style={{ marginLeft: 4 }}>
        <Icon className={"icon--attachment"} icon={"server"} />
      </div>
    </div>
  );
};

export default React.memo(AttachmentText);

import React from "react";

import classNames from "classnames";

import { util } from "lib";
import { Icon } from "components";

export interface AttachmentSizeTextProps extends StandardComponentProps {
  readonly children: Model.Attachment;
}

const AttachmentSizeText: React.FC<AttachmentSizeTextProps> = ({ children, ...props }) => (
  <div
    {...props}
    className={classNames("attachment-text", "attachment-size-text", props.className)}
  >
    <div className="content-text">{util.files.fileSizeString(children.size)}</div>
    <div className="icon-wrapper" style={{ marginLeft: 4 }}>
      <Icon className="icon--attachment" icon="server" />
    </div>
  </div>
);

export default React.memo(AttachmentSizeText);

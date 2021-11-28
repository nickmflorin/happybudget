import React from "react";
import classNames from "classnames";
import { map } from "lodash";

import { RenderWithSpinner } from "components";

import AttachmentListItem from "./AttachmentListItem";
import "./AttachmentsList.scss";

interface AttachmentsListProps extends StandardComponentProps {
  readonly attachments: Model.Attachment[];
  readonly loading?: boolean;
  readonly onDelete?: (m: Model.Attachment) => void;
  readonly isDeleting?: (id: number) => void;
}

const AttachmentsList = ({ attachments, loading, onDelete, isDeleting, ...props }: AttachmentsListProps) => {
  return (
    <RenderWithSpinner loading={loading}>
      <div {...props} className={classNames("attachments-list", props.className)}>
        {map(attachments, (attachment: Model.Attachment, index: number) => (
          <AttachmentListItem
            key={index}
            attachment={attachment}
            onClick={() => onDelete?.(attachment)}
            deleting={isDeleting?.(attachment.id) || false}
          />
        ))}
      </div>
    </RenderWithSpinner>
  );
};

export default React.memo(AttachmentsList);

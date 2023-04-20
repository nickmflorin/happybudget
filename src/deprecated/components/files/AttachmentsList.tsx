import React from "react";

import classNames from "classnames";
import { map } from "lodash";

import { RenderWithSpinner } from "components";

import AttachmentListItem from "./AttachmentListItem";

type AttachmentsListProps = StandardComponentProps & {
  readonly attachments: Model.Attachment[];
  readonly loading?: boolean;
  readonly onDelete?: (m: Model.Attachment) => void;
  readonly isDeleting?: (id: number) => void;
  readonly onDownloadError: (e: Error) => void;
};

const AttachmentsList = ({
  attachments,
  loading,
  onDelete,
  isDeleting,
  onDownloadError,
  ...props
}: AttachmentsListProps) => (
  <RenderWithSpinner loading={loading}>
    <div {...props} className={classNames("attachments-list", props.className)}>
      {map(attachments, (attachment: Model.Attachment, index: number) => (
        <AttachmentListItem
          key={index}
          attachment={attachment}
          onClick={() => onDelete?.(attachment)}
          deleting={isDeleting?.(attachment.id) || false}
          onDownloadError={onDownloadError}
        />
      ))}
    </div>
  </RenderWithSpinner>
);

export default React.memo(AttachmentsList);

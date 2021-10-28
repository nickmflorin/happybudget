import classNames from "classnames";
import { map } from "lodash";

import AttachmentListItem from "./AttachmentListItem";
import "./AttachmentsList.scss";

interface AttachmentsListProps extends StandardComponentProps {
  readonly attachments: Model.Attachment[];
  readonly showSize?: boolean;
  readonly onDelete?: (m: Model.Attachment) => void;
  readonly isDeleting?: (id: number) => void;
}

const AttachmentsList = ({ attachments, showSize, onDelete, isDeleting, ...props }: AttachmentsListProps) => {
  return (
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
  );
};

export default AttachmentsList;

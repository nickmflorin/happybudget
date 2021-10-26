import classNames from "classnames";
import { map } from "lodash";

import AttachmentListItem from "./AttachmentListItem";
import "./AttachmentsList.scss";

interface AttachmentsListProps extends StandardComponentProps {
  readonly attachments: Model.Attachment[];
  readonly showSize?: boolean;
}

const AttachmentsList = ({ attachments, showSize, ...props }: AttachmentsListProps) => (
  <div {...props} className={classNames("attachments-list", props.className)}>
    {map(attachments, (attachment: Model.Attachment, index: number) => (
      <AttachmentListItem key={index} attachment={attachment} showSize={showSize} />
    ))}
  </div>
);

export default AttachmentsList;

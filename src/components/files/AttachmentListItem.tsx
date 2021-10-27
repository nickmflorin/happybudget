import classNames from "classnames";

import { TrashButton } from "components/buttons";

import AttachmentText from "./AttachmentText";
import AttachmentSizeText from "./AttachmentSizeText";

interface AttachmentListItemProps extends StandardComponentProps {
  readonly attachment: Model.Attachment;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
}

const AttachmentListItem = ({ attachment, disabled, onClick, ...props }: AttachmentListItemProps) => (
  <div {...props} className={classNames("attachment-list-item", props.className, { disabled })}>
    <div className={"attachment-list-item-left"}>
      <AttachmentText>{attachment}</AttachmentText>
      <AttachmentSizeText>{attachment}</AttachmentSizeText>
    </div>
    <div className={"btn-wrapper"}>
      <TrashButton disabled={disabled} onClick={() => onClick?.()} />
    </div>
  </div>
);

export default AttachmentListItem;

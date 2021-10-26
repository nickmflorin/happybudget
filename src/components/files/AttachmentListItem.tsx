import classNames from "classnames";

import { util } from "lib";

import { ShowHide, Icon } from "components";
import { TrashButton } from "components/buttons";

import FileIcon from "./FileIcon";

interface AttachmentListItemProps extends StandardComponentProps {
  readonly attachment: Model.Attachment;
  readonly showSize?: boolean;
}

const AttachmentListItem = ({ attachment, showSize, ...props }: AttachmentListItemProps) => (
  <div {...props} className={classNames("attachment-list-item", props.className)}>
    <div className={"icon-wrapper"}>
      <FileIcon className={"icon--attachment-text"} name={attachment.name} ext={attachment.extension} />
    </div>
    <div className={"name-wrapper"}>{attachment.name}</div>
    <ShowHide show={showSize}>
      <div className={"size-wrapper"}>
        <div className={"size-text"}>{util.files.fileSizeString(attachment.size)}</div>
        <div className={"icon-wrapper"}>
          <Icon icon={"server"} />
        </div>
      </div>
    </ShowHide>
    <TrashButton style={{ height: 22, width: 22 }} onClick={() => {}} />
  </div>
);

export default AttachmentListItem;

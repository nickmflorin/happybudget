import classNames from "classnames";

import * as fs from "lib/fs";
import { attachment } from "lib/model";
import * as icons from "lib/ui/icons";
import * as ui from "lib/ui/types";
import { Icon } from "components/icons";

export type AttachmentSizeTextProps = ui.ComponentProps<{
  readonly model: attachment.Attachment;
}>;

export const AttachmentSizeText: React.FC<AttachmentSizeTextProps> = ({ model, ...props }) => (
  <div
    {...props}
    className={classNames("attachment-text", "attachment-text--size", props.className)}
  >
    <div className="attachment-text__sub-text">{fs.fileSizeString(model.size)}</div>
    <Icon className="icon--attachment" icon={icons.IconNames.SERVER} />
  </div>
);

import classNames from "classnames";

import { ui, model, fs } from "lib";
import { Icon } from "components/icons";

export type AttachmentSizeTextProps = ui.ComponentProps<{
  readonly model: model.Attachment;
}>;

export const AttachmentSizeText: React.FC<AttachmentSizeTextProps> = ({ model, ...props }) => (
  <div
    {...props}
    className={classNames("attachment-text", "attachment-text--size", props.className)}
  >
    <div className="attachment-text__sub-text">{fs.fileSizeString(model.size)}</div>
    <Icon className="icon--attachment" icon={ui.IconNames.SERVER} />
  </div>
);

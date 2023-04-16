import classNames from "classnames";

import { model, ui } from "lib";
import { FileIcon } from "components/icons";

export type AttachmentTextProps = ui.ComponentProps<{
  readonly model: model.Attachment | model.SimpleAttachment;
  readonly additionalCount?: number;
}>;

export const AttachmentText: React.FC<AttachmentTextProps> = ({
  model,
  additionalCount,
  ...props
}) => (
  <div {...props} className={classNames("attachment-text", props.className)}>
    <FileIcon className="icon--attachment" name={model.name} ext={model.extension} />
    <div className="attachment-text__sub-text">{model.name}</div>
    {additionalCount !== undefined && additionalCount !== 0 && (
      <div className="attachment-text__sub-text">{`(${additionalCount} more...)`}</div>
    )}
  </div>
);

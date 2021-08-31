import { ShowHide } from "components";
import { TextArea } from "components/fields";
import { TextWithLink } from "components/links";

import "./CommentEdit.scss";

interface CommentEditProps {
  visible: boolean;
  value: string;
  setValue: (val: string) => void;
  onSubmit: (text: string) => void;
  onClose: () => void;
}

const CommentEdit = ({ visible, value, setValue, onSubmit, onClose }: CommentEditProps): JSX.Element => {
  return (
    <ShowHide show={visible}>
      <div className={"comment-edit"}>
        <div className={"comment-edit-body"}>
          <TextArea
            maxLength={1028}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setValue(e.target.value);
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.code === "Enter") {
                onClose();
                onSubmit(value);
              } else if (e.code === "Escape") {
                setValue("");
                onClose();
              }
            }}
          />
        </div>
        <div className={"comment-edit-footer"}>
          <TextWithLink>
            {"Press Esc to"}
            <TextWithLink.Link onClick={() => onClose()}>{"Cancel"}</TextWithLink.Link>
          </TextWithLink>
        </div>
      </div>
    </ShowHide>
  );
};

export default CommentEdit;

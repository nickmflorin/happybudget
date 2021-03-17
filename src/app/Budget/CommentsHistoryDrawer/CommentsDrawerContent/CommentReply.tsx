import { useEffect, useState } from "react";
import { Input } from "antd";

import { ShowHide } from "components/display";
import { AccountCircleLink } from "components/control/links";
import { ButtonLink } from "components/control/buttons";

import "./CommentReply.scss";

interface CommentReplyProps {
  visible: boolean;
  comment: IComment;
  onSubmit: (text: string) => void;
  onClose: () => void;
}

const CommentReply = ({ comment, visible, onSubmit, onClose }: CommentReplyProps): JSX.Element => {
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (visible === false) {
      setReplyText("");
    }
    return () => {
      setReplyText("");
    };
  }, [visible]);

  return (
    <ShowHide show={visible}>
      <div className={"comment-reply"}>
        <div className={"comment-reply-body"}>
          <div className={"account-circle-wrapper"}>
            <AccountCircleLink user={comment.user} />
          </div>
          <Input.TextArea
            maxLength={1028}
            value={replyText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              setReplyText(e.target.value);
            }}
            onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
              if (e.code === "Enter") {
                onClose();
                onSubmit(replyText);
              } else if (e.code === "Escape") {
                setReplyText("");
                onClose();
              }
            }}
          />
        </div>
        <div className={"comment-reply-footer"}>
          <span className={"cancel-text"}>
            {"Press Esc to"}
            <ButtonLink className={"cancel-link"} onClick={() => onClose()}>
              {"Cancel"}
            </ButtonLink>
          </span>
        </div>
      </div>
    </ShowHide>
  );
};

export default CommentReply;

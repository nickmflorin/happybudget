import { useEffect, useState } from "react";

import { ShowHide } from "components";
import { TextArea } from "components/fields";
import { AccountCircleLink } from "components/links";
import { TextWithLink } from "components/links";

import "./CommentReply.scss";

interface CommentReplyProps {
  visible: boolean;
  comment: Model.Comment;
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
          <TextArea
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
          <TextWithLink>
            {"Press Esc to"}
            <TextWithLink.Link onClick={() => onClose()}>{"Cancel"}</TextWithLink.Link>
          </TextWithLink>
        </div>
      </div>
    </ShowHide>
  );
};

export default CommentReply;

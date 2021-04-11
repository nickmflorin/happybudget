import { useState } from "react";
import { isNil } from "lodash";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply } from "@fortawesome/free-solid-svg-icons";
import { faThumbsUp, faEdit, faTrashAlt } from "@fortawesome/free-regular-svg-icons";

import { IconButton } from "components/buttons";
import { AccountCircleLink } from "components/links";
import { ShowHide } from "components";
import { toDisplayTimeSince } from "lib/util/dates";
import { useLoggedInUser } from "store/hooks";

import CommentEdit from "./CommentEdit";
import "./Comment.scss";

const CommentHeader = (props: { comment: IComment }): JSX.Element => {
  return (
    <div className={"comment-header"}>
      <AccountCircleLink user={props.comment.user} />
      <div className={"comment-user-name"}>{props.comment.user.full_name}</div>
      <div className={"comment-updated-at"}>{toDisplayTimeSince(props.comment.updated_at)}</div>
    </div>
  );
};

interface CommentBodyProps {
  comment: IComment;
  onDoneEditing: (value: string) => void;
  onCancelEditing: () => void;
  editing: boolean;
}

const CommentBody = ({ comment, editing, onDoneEditing, onCancelEditing }: CommentBodyProps): JSX.Element => {
  const [text, setText] = useState(comment.text);

  return (
    <div className={"comment-body"}>
      <CommentEdit
        visible={editing}
        setValue={(val: string) => setText(val)}
        value={text}
        onClose={() => onCancelEditing()}
        onSubmit={(t: string) => onDoneEditing(t)}
      />
      <ShowHide show={!editing}>
        <div className={"comment-body-text"}>{text}</div>
      </ShowHide>
    </div>
  );
};

interface CommentFooterProps {
  comment: IComment;
  onDelete?: () => void;
  onEdit?: () => void;
  onLike?: () => void;
  onReply?: () => void;
}

const ComentFooter = ({ comment, onDelete, onEdit, onLike, onReply }: CommentFooterProps): JSX.Element => {
  const user = useLoggedInUser();

  return (
    <div className={"comment-footer"}>
      <div className={"comment-footer-left"}>
        <IconButton
          className={"dark"}
          size={"small"}
          icon={<FontAwesomeIcon icon={faReply} />}
          onClick={() => !isNil(onReply) && onReply()}
        />
        <IconButton
          className={"dark"}
          size={"small"}
          icon={<FontAwesomeIcon icon={faThumbsUp} />}
          onClick={() => !isNil(onLike) && onLike()}
        />
      </div>
      <ShowHide show={user.id === comment.user.id}>
        <div className={"comment-footer-right"}>
          <IconButton
            className={"dark"}
            size={"small"}
            icon={<FontAwesomeIcon icon={faEdit} />}
            onClick={() => !isNil(onEdit) && onEdit()}
          />
          <IconButton
            className={"dark"}
            size={"small"}
            icon={<FontAwesomeIcon icon={faTrashAlt} />}
            onClick={() => !isNil(onDelete) && onDelete()}
          />
        </div>
      </ShowHide>
    </div>
  );
};

interface CommentProps {
  comment: IComment;
  onDelete?: () => void;
  onDoneEditing?: (value: string) => void;
  onLike?: () => void;
  onReply?: () => void;
}

const Comment = ({ comment, onDelete, onDoneEditing, onLike, onReply }: CommentProps): JSX.Element => {
  const [editing, setEditing] = useState(false);

  return (
    <div className={"comment"}>
      <CommentHeader comment={comment} />
      <CommentBody
        comment={comment}
        editing={editing}
        onCancelEditing={() => setEditing(false)}
        onDoneEditing={(value: string) => {
          setEditing(false);
          if (!isNil(onDoneEditing)) {
            onDoneEditing(value);
          }
        }}
      />
      <ShowHide show={!editing}>
        <ComentFooter
          comment={comment}
          onDelete={onDelete}
          onEdit={() => setEditing(true)}
          onLike={onLike}
          onReply={onReply}
        />
      </ShowHide>
    </div>
  );
};

Comment.Header = CommentHeader;
Comment.Body = CommentBody;

export default Comment;

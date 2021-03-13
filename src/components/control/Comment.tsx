import React, { useState } from "react";
import { isNil } from "lodash";

import { Input } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply } from "@fortawesome/free-solid-svg-icons";
import { faThumbsUp, faThumbsDown, faEdit, faTrashAlt } from "@fortawesome/free-regular-svg-icons";

import { IconButton } from "components/control/buttons";
import { AccountCircleLink } from "components/control/links";
import { ShowHide, RenderWithSpinner } from "components/display";
import { toDisplayTimeSince } from "util/dates";

import { useLoggedInUser } from "store/hooks";

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
  editing: boolean;
}

const CommentBody = ({ comment, editing, onDoneEditing }: CommentBodyProps): JSX.Element => {
  const [text, setText] = useState(comment.text);

  return (
    <div className={"comment-body"}>
      <ShowHide show={editing}>
        <Input.TextArea
          maxLength={1028}
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setText(e.target.value);
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.code === "Enter") {
              onDoneEditing(text);
            }
          }}
        />
      </ShowHide>
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
  onDislike?: () => void;
  onReply?: () => void;
}

const ComentFooter = ({ comment, onDelete, onEdit, onLike, onDislike, onReply }: CommentFooterProps): JSX.Element => {
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
        <IconButton
          className={"dark"}
          size={"small"}
          icon={<FontAwesomeIcon icon={faThumbsDown} />}
          onClick={() => !isNil(onDislike) && onDislike()}
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
  loading?: boolean;
  onDelete?: () => void;
  onDoneEditing?: (value: string) => void;
  onLike?: () => void;
  onDislike?: () => void;
  onReply?: () => void;
}

const Comment = ({
  comment,
  loading,
  onDelete,
  onDoneEditing,
  onLike,
  onDislike,
  onReply
}: CommentProps): JSX.Element => {
  const [editing, setEditing] = useState(false);

  return (
    <RenderWithSpinner className={"comment"} loading={loading} toggleOpacity={true} spinnerProps={{ color: "#b5b5b5" }}>
      <CommentHeader comment={comment} />
      <CommentBody
        comment={comment}
        editing={editing}
        onDoneEditing={(value: string) => {
          setEditing(false);
          if (!isNil(onDoneEditing)) {
            onDoneEditing(value);
          }
        }}
      />
      <ComentFooter
        comment={comment}
        onDelete={onDelete}
        onEdit={() => setEditing(true)}
        onLike={onLike}
        onDislike={onDislike}
        onReply={onReply}
      />
    </RenderWithSpinner>
  );
};

Comment.Header = CommentHeader;
Comment.Body = CommentBody;

export default Comment;

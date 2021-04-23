import { useState } from "react";
import classNames from "classnames";

import { RenderWithSpinner, ShowHide } from "components";

import Comment from "./Comment";
import CommentReply from "./CommentReply";
import Comments from "./Comments";

import "./CommentBlock.scss";

interface CommentBlockProps {
  comment: Model.Comment;
  nested?: boolean;
  loading: boolean;
  commentLoading: (comment: Model.Comment) => boolean;
  onDelete: (comment: Model.Comment) => void;
  onLike: (comment: Model.Comment) => void;
  onDoneEditing: (comment: Model.Comment, value: string) => void;
  onDoneReplying: (comment: Model.Comment, value: string) => void;
}

const CommentBlock = ({
  comment,
  nested,
  loading,
  commentLoading,
  onDelete,
  onLike,
  onDoneEditing,
  onDoneReplying
}: CommentBlockProps): JSX.Element => {
  const [replying, setReplying] = useState(false);

  return (
    <RenderWithSpinner
      className={classNames("comment-block", { nested })}
      size={15}
      loading={loading}
      toggleOpacity={true}
      color={"#b5b5b5"}
    >
      <Comment
        comment={comment}
        onReply={() => setReplying(true)}
        onDelete={() => onDelete(comment)}
        onLike={() => onLike(comment)}
        onDoneEditing={(value: string) => onDoneEditing(comment, value)}
      />
      <ShowHide show={comment.comments.length !== 0}>
        <Comments
          comments={comment.comments}
          nested={true}
          commentLoading={commentLoading}
          onDelete={onDelete}
          onLike={onLike}
          onDoneEditing={onDoneEditing}
          onDoneReplying={onDoneReplying}
        />
      </ShowHide>
      <CommentReply
        comment={comment}
        visible={replying}
        onSubmit={(text: string) => onDoneReplying(comment, text)}
        onClose={() => setReplying(false)}
      />
    </RenderWithSpinner>
  );
};

export default CommentBlock;

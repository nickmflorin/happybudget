import { useState } from "react";
import { isNil } from "lodash";
import classNames from "classnames";

import { ShowHide } from "components/display";

import Comment from "./Comment";
import CommentReply from "./CommentReply";
import Comments from "./Comments";

import "./CommentBlock.scss";

interface CommentBlockProps {
  comment: IComment;
  nested?: boolean;
  commentLoading?: (comment: IComment) => boolean;
  onDelete: (comment: IComment) => void;
  onLike: (comment: IComment) => void;
  onDislike: (comment: IComment) => void;
  onDoneEditing: (comment: IComment, value: string) => void;
  onDoneReplying: (comment: IComment, value: string) => void;
}

const CommentBlock = ({
  comment,
  nested,
  commentLoading,
  onDelete,
  onLike,
  onDislike,
  onDoneEditing,
  onDoneReplying
}: CommentBlockProps): JSX.Element => {
  const [replying, setReplying] = useState(false);

  return (
    <div className={classNames("comment-block", { nested })}>
      <Comment
        comment={comment}
        onReply={() => setReplying(true)}
        loading={!isNil(commentLoading) && commentLoading(comment)}
        onDelete={() => onDelete(comment)}
        onLike={() => onLike(comment)}
        onDislike={() => onDislike(comment)}
        onDoneEditing={(value: string) => onDoneEditing(comment, value)}
      />
      <ShowHide show={comment.comments.length !== 0}>
        <Comments
          comments={comment.comments}
          nested={true}
          loading={!isNil(commentLoading) && commentLoading(comment)}
          onDelete={onDelete}
          onLike={onLike}
          onDislike={onDislike}
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
    </div>
  );
};

export default CommentBlock;

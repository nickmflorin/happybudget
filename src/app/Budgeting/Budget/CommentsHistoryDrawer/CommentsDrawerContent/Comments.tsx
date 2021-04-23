import { map } from "lodash";

import { RenderWithSpinner, ShowHide } from "components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentAlt } from "@fortawesome/pro-light-svg-icons";

import CommentBlock from "./CommentBlock";

export interface CommentsProps {
  // We don't want to include the loading parameter when the Comments component
  // is nested, because the parent <CommentBlock /> component will handle the
  // loading indicator.  If we include loading={true} when nested={true}, a
  // loading indicator will be shown for both the <CommentBlock /> (which contains
  // the comment itself and it's children) and the specific <Comment />, for a
  // total of 2 loading indicators.
  loading?: boolean;
  comments: Model.Comment[];
  nested?: boolean;
  commentLoading: (comment: Model.Comment) => boolean;
  onDelete: (comment: Model.Comment) => void;
  onLike: (comment: Model.Comment) => void;
  onDoneEditing: (comment: Model.Comment, value: string) => void;
  onDoneReplying: (comment: Model.Comment, value: string) => void;
}

const Comments = ({
  comments,
  loading,
  nested = false,
  commentLoading,
  onDelete,
  onLike,
  onDoneEditing,
  onDoneReplying
}: CommentsProps): JSX.Element => {
  return (
    <RenderWithSpinner size={15} loading={loading} toggleOpacity={true} color={"#b5b5b5"}>
      <ShowHide show={comments.length !== 0}>
        {map(comments, (comment: Model.Comment, index: number) => (
          <CommentBlock
            nested={nested}
            comment={comment}
            loading={commentLoading(comment)}
            commentLoading={commentLoading}
            onDelete={onDelete}
            onLike={onLike}
            onDoneEditing={onDoneEditing}
            onDoneReplying={onDoneReplying}
          />
        ))}
      </ShowHide>
      <ShowHide show={comments.length === 0 && nested === false}>
        <div className={"no-data-wrapper"}>
          <FontAwesomeIcon icon={faCommentAlt} size={"6x"} color={"gray"} />
          <div className={"text-container"}>{"No Comments yet, give some Notes!"}</div>
        </div>
      </ShowHide>
    </RenderWithSpinner>
  );
};

export default Comments;

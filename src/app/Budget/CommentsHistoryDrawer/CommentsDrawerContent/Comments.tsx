import { map } from "lodash";
import { Empty } from "antd";

import { RenderWithSpinner, ShowHide } from "components/display";

import CommentBlock from "./CommentBlock";

export interface CommentsProps {
  loading: boolean;
  comments: IComment[];
  nested?: boolean;
  commentLoading?: (comment: IComment) => boolean;
  onDelete: (comment: IComment) => void;
  onLike: (comment: IComment) => void;
  onDislike: (comment: IComment) => void;
  onDoneEditing: (comment: IComment, value: string) => void;
  onDoneReplying: (comment: IComment, value: string) => void;
}

const Comments = ({
  comments,
  loading,
  nested = false,
  commentLoading,
  onDelete,
  onLike,
  onDislike,
  onDoneEditing,
  onDoneReplying
}: CommentsProps): JSX.Element => {
  return (
    <RenderWithSpinner absolute size={15} loading={loading} toggleOpacity={true} color={"#b5b5b5"}>
      <ShowHide show={comments.length !== 0}>
        {map(comments, (comment: IComment, index: number) => (
          <CommentBlock
            nested={nested}
            comment={comment}
            commentLoading={commentLoading}
            onDelete={onDelete}
            onLike={onLike}
            onDislike={onDislike}
            onDoneEditing={onDoneEditing}
            onDoneReplying={onDoneReplying}
          />
        ))}
      </ShowHide>
      <ShowHide show={comments.length === 0 && nested === false}>
        <div className={"no-data-wrapper"}>
          <Empty className={"empty"} description={"No Comments!"} />
        </div>
      </ShowHide>
    </RenderWithSpinner>
  );
};

export default Comments;

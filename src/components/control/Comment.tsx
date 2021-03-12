import { AccountCircleLink } from "components/control/links";
import { toDisplayTimeSince } from "util/dates";

import "./Comment.scss";

interface CommentProps {
  comment: IComment;
}

const CommentHeader = (props: { user: ISimpleUser; updatedAt: string }): JSX.Element => {
  return (
    <div className={"comment-header"}>
      <AccountCircleLink user={props.user} />
      <div className={"comment-user-name"}>{props.user.full_name}</div>
      <div className={"comment-updated-at"}>{toDisplayTimeSince(props.updatedAt)}</div>
    </div>
  );
};

const CommentBody = (props: { text: string }): JSX.Element => {
  return <div className={"comment-body"}>{props.text}</div>;
};

const Comment = ({ comment }: CommentProps): JSX.Element => {
  return (
    <div className={"comment"}>
      <CommentHeader user={comment.user} updatedAt={comment.updated_at} />
      <CommentBody text={comment.text} />
    </div>
  );
};

Comment.Header = CommentHeader;
Comment.Body = CommentBody;

export default Comment;

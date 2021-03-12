import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faReply } from "@fortawesome/free-solid-svg-icons";
import { faThumbsUp, faThumbsDown, faEdit, faTrashAlt } from "@fortawesome/free-regular-svg-icons";

import { IconButton } from "components/control/buttons";
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

const ComentFooter = (): JSX.Element => {
  return (
    <div className={"comment-footer"}>
      <div className={"comment-footer-left"}>
        <IconButton
          className={"dark"}
          size={"small"}
          icon={<FontAwesomeIcon icon={faReply} />}
          onClick={() => console.log("Clicked")}
        />
        <IconButton
          className={"dark"}
          size={"small"}
          icon={<FontAwesomeIcon icon={faThumbsUp} />}
          onClick={() => console.log("Clicked")}
        />
        <IconButton
          className={"dark"}
          size={"small"}
          icon={<FontAwesomeIcon icon={faThumbsDown} />}
          onClick={() => console.log("Clicked")}
        />
      </div>
      <div className={"comment-footer-right"}>
        <IconButton
          className={"dark"}
          size={"small"}
          icon={<FontAwesomeIcon icon={faEdit} />}
          onClick={() => console.log("Clicked")}
        />
        <IconButton
          className={"dark"}
          size={"small"}
          icon={<FontAwesomeIcon icon={faTrashAlt} />}
          onClick={() => console.log("Clicked")}
        />
      </div>
    </div>
  );
};

const Comment = ({ comment }: CommentProps): JSX.Element => {
  return (
    <div className={"comment"}>
      <CommentHeader user={comment.user} updatedAt={comment.updated_at} />
      <CommentBody text={comment.text} />
      <ComentFooter />
    </div>
  );
};

Comment.Header = CommentHeader;
Comment.Body = CommentBody;

export default Comment;

import React, { useState } from "react";
import { map, isNil } from "lodash";
import classNames from "classnames";
import { Empty, Input } from "antd";

import { RenderWithSpinner, ShowHide } from "components/display";

import Comment from "./Comment";
import "./Comments.scss";

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
  // TODO: We need to figure out how to separate this out for each comment that
  // we can reply to, since the state will get jumbled between the different
  // comments.
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  return (
    <RenderWithSpinner
      className={classNames("comments", { nested })}
      loading={loading}
      toggleOpacity={true}
      spinnerProps={{ color: "#b5b5b5" }}
    >
      <ShowHide show={comments.length !== 0}>
        {map(comments, (comment: IComment, index: number) => (
          <React.Fragment>
            <Comment
              key={index}
              comment={comment}
              setReplying={setReplying}
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
            <ShowHide show={replying}>
              <Input.TextArea
                maxLength={1028}
                value={replyText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setReplyText(e.target.value);
                }}
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.code === "Enter") {
                    onDoneReplying(comment, replyText);
                  }
                }}
              />
            </ShowHide>
          </React.Fragment>
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

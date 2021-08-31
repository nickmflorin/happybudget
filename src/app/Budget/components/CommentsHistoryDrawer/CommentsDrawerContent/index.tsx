import React, { useState, useEffect } from "react";

import { Button } from "components/buttons";
import { TextArea } from "components/fields";
import { Drawer } from "components/layout";
import Comments from "./Comments";

import "./index.scss";

export interface CommentsDrawerContentProps {
  loading: boolean;
  comments: Model.Comment[];
  submitting: boolean;
  commentLoading: (comment: Model.Comment) => boolean;
  onSubmit: (payload: Http.CommentPayload) => void;
  onRequest: () => void;
  onDelete: (comment: Model.Comment) => void;
  onLike: (comment: Model.Comment) => void;
  onDoneEditing: (comment: Model.Comment, value: string) => void;
  onDoneReplying: (comment: Model.Comment, value: string) => void;
}

const CommentsDrawerContent = ({
  comments,
  loading,
  submitting,
  commentLoading,
  onSubmit,
  onRequest,
  onDelete,
  onLike,
  onDoneEditing,
  onDoneReplying
}: CommentsDrawerContentProps): JSX.Element => {
  const [text, setText] = useState("");

  useEffect(() => {
    onRequest();
  }, []);

  return (
    <React.Fragment>
      <Drawer.Content className={"comments-drawer-content"} noPadding>
        <div className={"comments-section"}>
          <Comments
            comments={comments}
            loading={loading}
            commentLoading={commentLoading}
            onDelete={onDelete}
            onLike={onLike}
            onDoneEditing={onDoneEditing}
            onDoneReplying={onDoneReplying}
          />
        </div>
      </Drawer.Content>
      <Drawer.Footer className={"form-section"}>
        <TextArea
          style={{ marginBottom: 10, height: "5rem" }}
          placeholder={"Leave comment here..."}
          maxLength={1028}
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setText(e.target.value);
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.code === "Enter" && text.trim() !== "") {
              e.stopPropagation();
              onSubmit({ text });
              setText("");
            }
          }}
        />
        <Button
          disabled={text.trim() === ""}
          loading={submitting}
          className={"btn btn--primary"}
          style={{ width: "100%" }}
          onClick={() => onSubmit({ text })}
        >
          {"Send"}
        </Button>
      </Drawer.Footer>
    </React.Fragment>
  );
};

export default CommentsDrawerContent;

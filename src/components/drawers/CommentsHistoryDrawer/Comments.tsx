import React, { useEffect } from "react";
import { includes, map } from "lodash";

import { Form, Input, Button, Empty } from "antd";

import { Comment } from "components/control";
import { RenderWithSpinner, ShowHide } from "components/display";
import { Drawer } from "components/layout";

export interface CommentsProps {
  loading: boolean;
  comments: IComment[];
  deleting: number[];
  editing: number[];
  submitting: boolean;
  onSubmit: (payload: Http.ICommentPayload) => void;
  onRequest: () => void;
  onDelete: (comment: IComment) => void;
  onLike: (comment: IComment) => void;
  onDislike: (comment: IComment) => void;
  onDoneEditing: (comment: IComment, value: string) => void;
}

const Comments = ({
  comments,
  loading,
  submitting,
  deleting,
  editing,
  onSubmit,
  onRequest,
  onDelete,
  onLike,
  onDislike,
  onDoneEditing
}: CommentsProps): JSX.Element => {
  const [form] = Form.useForm();

  useEffect(() => {
    onRequest();
  }, []);

  return (
    <React.Fragment>
      <Drawer.Content className={"comments"} noPadding>
        <div className={"comments-section"}>
          <RenderWithSpinner loading={loading}>
            <ShowHide show={comments.length !== 0}>
              {map(comments, (comment: IComment, index: number) => (
                <Comment
                  key={index}
                  comment={comment}
                  loading={includes(deleting, comment.id) || includes(editing, comment.id)}
                  onDelete={() => onDelete(comment)}
                  onLike={() => onLike(comment)}
                  onDislike={() => onDislike(comment)}
                  onDoneEditing={(value: string) => onDoneEditing(comment, value)}
                />
              ))}
            </ShowHide>
            <ShowHide show={comments.length === 0}>
              <div className={"no-data-wrapper"}>
                <Empty className={"empty"} description={"No Comments!"} />
              </div>
            </ShowHide>
          </RenderWithSpinner>
        </div>
      </Drawer.Content>
      <Drawer.Footer className={"form-section"}>
        <Form
          form={form}
          layout={"vertical"}
          initialValues={{}}
          onFinish={(payload: Http.ICommentPayload) => onSubmit(payload)}
        >
          <Form.Item name={"text"} rules={[{ required: true, message: "Please enter a comment to send!" }]}>
            <Input.TextArea style={{ minHeight: 120 }} maxLength={1028} placeholder={"Leave comment here..."} />
          </Form.Item>
          <Button htmlType={"submit"} loading={submitting} className={"btn--primary"} style={{ width: "100%" }}>
            {"Send"}
          </Button>
        </Form>
      </Drawer.Footer>
    </React.Fragment>
  );
};

export default Comments;

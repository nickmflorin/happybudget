import React, { useEffect } from "react";

import { Form, Input, Button } from "antd";

import { Comments } from "components/ui";
import { Drawer } from "components/layout";

export interface CommentsDrawerContentProps {
  loading: boolean;
  comments: IComment[];
  submitting: boolean;
  commentLoading: (comment: IComment) => boolean;
  onSubmit: (payload: Http.ICommentPayload) => void;
  onRequest: () => void;
  onDelete: (comment: IComment) => void;
  onLike: (comment: IComment) => void;
  onDislike: (comment: IComment) => void;
  onDoneEditing: (comment: IComment, value: string) => void;
  onDoneReplying: (comment: IComment, value: string) => void;
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
  onDislike,
  onDoneEditing,
  onDoneReplying
}: CommentsDrawerContentProps): JSX.Element => {
  const [form] = Form.useForm();

  useEffect(() => {
    onRequest();
  }, []);

  return (
    <React.Fragment>
      <Drawer.Content className={"comments"} noPadding>
        <div className={"comments-section"}>
          <Comments
            comments={comments}
            loading={loading}
            commentLoading={commentLoading}
            onDelete={onDelete}
            onLike={onLike}
            onDislike={onDislike}
            onDoneEditing={onDoneEditing}
            onDoneReplying={onDoneReplying}
          />
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

export default CommentsDrawerContent;

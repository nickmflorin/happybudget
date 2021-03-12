import React, { useEffect } from "react";
import { map } from "lodash";

import { Form, Input, Button, Empty } from "antd";

import { Comment } from "components/control";
import { RenderWithSpinner, ShowHide } from "components/display";
import { Drawer } from "components/layout";

export interface CommentsProps {
  loading: boolean;
  comments: IComment[];
  submitting: boolean;
  onSubmit: (payload: Http.ICommentPayload) => void;
  onRequest: () => void;
}

const Comments = ({ comments, loading, submitting, onSubmit, onRequest }: CommentsProps): JSX.Element => {
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
                <Comment key={index} comment={comment} />
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

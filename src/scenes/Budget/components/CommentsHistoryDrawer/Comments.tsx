import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { map } from "lodash";

import { Form, Input, Button, Empty } from "antd";

import { Comment } from "components/control";
import { RenderWithSpinner, ShowHide } from "components/display";
import { Drawer } from "components/layout";
import { requestBudgetCommentsAction, submitBudgetCommentAction } from "../Calculator/actions";

const Comments = (): JSX.Element => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const comments = useSelector((state: Redux.IApplicationStore) => state.calculator.accounts.comments);

  useEffect(() => {
    dispatch(requestBudgetCommentsAction());
  }, []);

  return (
    <React.Fragment>
      <Drawer.Content className={"comments-comments"} noPadding>
        <div className={"comments-section"}>
          <RenderWithSpinner loading={comments.loading}>
            <ShowHide show={comments.data.length !== 0}>
              {map(comments.data, (comment: IComment, index: number) => (
                <Comment key={index} comment={comment} />
              ))}
            </ShowHide>
            <ShowHide show={comments.data.length === 0}>
              <Empty className={"empty"} description={"No Comments!"} />
            </ShowHide>
          </RenderWithSpinner>
        </div>
      </Drawer.Content>
      <Drawer.Footer className={"form-section"}>
        <Form
          className={"organization-form"}
          form={form}
          layout={"vertical"}
          initialValues={{}}
          onFinish={(values: Http.ICommentPayload) => dispatch(submitBudgetCommentAction(values))}
        >
          <Form.Item name={"text"} rules={[{ required: true, message: "Please enter a comment to send!" }]}>
            <Input.TextArea style={{ minHeight: 120 }} maxLength={1028} placeholder={"Leave comment here..."} />
          </Form.Item>
          <Button
            htmlType={"submit"}
            loading={comments.submitting}
            className={"btn--primary"}
            style={{ width: "100%" }}
          >
            {"Send"}
          </Button>
        </Form>
      </Drawer.Footer>
    </React.Fragment>
  );
};

export default Comments;

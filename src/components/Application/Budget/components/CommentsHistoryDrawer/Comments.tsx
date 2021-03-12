import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { map } from "lodash";

import { Form, Input, Button, Empty } from "antd";

import { RenderWithSpinner, ShowHide } from "components/display";
import { requestBudgetCommentsAction } from "../Calculator/actions";

const Comments = (): JSX.Element => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const comments = useSelector((state: Redux.IApplicationStore) => state.calculator.accounts.comments);

  useEffect(() => {
    dispatch(requestBudgetCommentsAction());
  }, []);

  return (
    <div className={"comments"}>
      <div className={"comments-section"}>
        <RenderWithSpinner loading={comments.loading}>
          <ShowHide show={comments.data.length !== 0}>
            {map(comments.data, (comment: IComment) => {
              return <div className={"comment"}>{comment.text}</div>;
            })}
          </ShowHide>
          <ShowHide show={comments.data.length === 0}>
            <Empty className={"empty"} description={"No Comments!"} />
          </ShowHide>
        </RenderWithSpinner>
      </div>
      <div className={"form-section"}>
        <Form
          className={"organization-form"}
          form={form}
          layout={"vertical"}
          initialValues={{}}
          onFinish={(values: any) => console.log(values)}
        >
          <Form.Item name={"text"} rules={[{ required: true, message: "Please enter a comment to send!" }]}>
            <Input.TextArea style={{ minHeight: 120 }} maxLength={1028} placeholder={"Leave comment here..."} />
          </Form.Item>
          <Button htmlType={"submit"} className={"btn--primary"} style={{ width: "100%" }}>
            {"Send"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Comments;

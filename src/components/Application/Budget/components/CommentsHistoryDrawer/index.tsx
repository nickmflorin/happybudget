import { useState } from "react";

import { Menu } from "antd";

import { ShowHide } from "components/display";
import Comments from "./Comments";
import History from "./History";
import "./index.scss";

type Page = "comments" | "history";

const CommentsHistoryDrawer = (): JSX.Element => {
  const [page, setPage] = useState<Page>("comments");
  const [loading, setLoading] = useState(false);

  return (
    <div className={"budget-comments-history-drawer"}>
      <Menu onClick={(info: any) => setPage(info.key)} selectedKeys={[page]} mode={"horizontal"}>
        <Menu.Item key={"comments"}>{"Comments"}</Menu.Item>
        <Menu.Item key={"history"}>{"History"}</Menu.Item>
      </Menu>
      <ShowHide show={page === "comments"}>
        <Comments />
      </ShowHide>
      <ShowHide show={page === "history"}>
        <History />
      </ShowHide>
    </div>
  );
};

export default CommentsHistoryDrawer;

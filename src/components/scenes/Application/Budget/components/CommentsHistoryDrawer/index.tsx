import { useState } from "react";

import { Menu } from "antd";

import { ShowHide } from "components/display";
import { HorizontalMenu } from "components/control";
import { IHorizontalMenuItem } from "components/control/HorizontalMenu";
import { Drawer } from "components/layout";

import Comments from "./Comments";
import History from "./History";
import "./index.scss";

type Page = "comments" | "history";

const CommentsHistoryDrawer = (): JSX.Element => {
  const [page, setPage] = useState<Page>("comments");
  const [loading, setLoading] = useState(false);

  return (
    <Drawer>
      <HorizontalMenu
        onChange={(item: IHorizontalMenuItem) => setPage(item.id)}
        selected={[page]}
        items={[
          { id: "comments", label: "Comments" },
          { id: "history", label: "History" }
        ]}
      />
      <ShowHide show={page === "comments"}>
        <Comments />
      </ShowHide>
      <ShowHide show={page === "history"}>
        <History />
      </ShowHide>
    </Drawer>
  );
};

export default CommentsHistoryDrawer;

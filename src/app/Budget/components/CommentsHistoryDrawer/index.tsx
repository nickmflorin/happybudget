import { useState } from "react";

import { ShowHide } from "components/display";
import { HorizontalMenu } from "components/control";
import { IHorizontalMenuItem } from "components/control/HorizontalMenu";
import { Drawer } from "components/layout";

import CommentsDrawerContent, { CommentsDrawerContentProps } from "./Comments";
import History from "./History";
import "./index.scss";

type Page = "comments" | "history";

interface CommentsHistoryDrawerProps {
  visible: boolean;
  commentsProps: CommentsDrawerContentProps;
}

const CommentsHistoryDrawer = ({ visible, commentsProps }: CommentsHistoryDrawerProps): JSX.Element => {
  const [page, setPage] = useState<Page>("comments");

  return (
    <Drawer className={"comments-history-drawer"} visible={visible}>
      <HorizontalMenu
        onChange={(item: IHorizontalMenuItem) => setPage(item.id)}
        selected={[page]}
        items={[
          { id: "comments", label: "Comments" },
          { id: "history", label: "History" }
        ]}
      />
      <ShowHide show={page === "comments"}>
        <CommentsDrawerContent {...commentsProps} />
      </ShowHide>
      <ShowHide show={page === "history"}>
        <History />
      </ShowHide>
    </Drawer>
  );
};

export default CommentsHistoryDrawer;

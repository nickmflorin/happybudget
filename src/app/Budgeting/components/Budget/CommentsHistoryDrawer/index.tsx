import { useState } from "react";
import { useSelector } from "react-redux";

import { ShowHide } from "components";
import { HorizontalMenu } from "components/menus";
import { IHorizontalMenuItem } from "components/menus/HorizontalMenu";
import { Drawer } from "components/layout";

import CommentsDrawerContent, { CommentsDrawerContentProps } from "./CommentsDrawerContent";
import HistoryDrawerContent, { HistoryDrawerContentProps } from "./HistoryDrawerContent";
import "./index.scss";

type Page = "comments" | "history";

interface CommentsHistoryDrawerProps {
  commentsProps: CommentsDrawerContentProps;
  historyProps: HistoryDrawerContentProps;
}

const CommentsHistoryDrawer = ({ commentsProps, historyProps }: CommentsHistoryDrawerProps): JSX.Element => {
  const [page, setPage] = useState<Page>("comments");
  const visible = useSelector((state: Modules.ApplicationStore) => state.budget.budget.commentsHistoryDrawerOpen);

  return (
    <Drawer className={"comments-history-drawer"} visible={visible}>
      <HorizontalMenu<Page>
        onChange={(item: IHorizontalMenuItem<Page>) => setPage(item.id)}
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
        <HistoryDrawerContent {...historyProps} />
      </ShowHide>
    </Drawer>
  );
};

export default CommentsHistoryDrawer;

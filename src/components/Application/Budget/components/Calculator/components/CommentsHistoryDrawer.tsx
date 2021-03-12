import { useState } from "react";
import { RenderWithSpinner } from "components/display";
import "./CommentsHistoryDrawer.scss";

const CommentsHistoryDrawer = (): JSX.Element => {
  const [loading, setLoading] = useState(false);

  return (
    <div className={"budget-comments-history-drawer"}>
      <RenderWithSpinner loading={loading}>
        <div>{"Comments"}</div>
      </RenderWithSpinner>
    </div>
  );
};

export default CommentsHistoryDrawer;

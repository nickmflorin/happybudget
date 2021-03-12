import { useState } from "react";
import { Drawer } from "antd";

import { RenderWithSpinner } from "components/display";

interface CommentsHistoryDrawerProps {
  visible: boolean;
  onClose: () => void;
}

const CommentsHistoryDrawer = ({ visible, onClose }: CommentsHistoryDrawerProps): JSX.Element => {
  const [loading, setLoading] = useState(false);

  return (
    <Drawer
      title={"Profile"}
      placement={"right"}
      closable={false}
      onClose={() => onClose()}
      visible={visible}
      width={350}
    >
      <RenderWithSpinner loading={loading}>
        <div>{"Comments"}</div>
      </RenderWithSpinner>
    </Drawer>
  );
};

export default CommentsHistoryDrawer;

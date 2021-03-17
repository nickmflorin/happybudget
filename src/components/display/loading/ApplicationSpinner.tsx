import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { Portal } from "components/layout";

const ApplicationSpinner = (): JSX.Element => {
  return (
    <Portal id={"application-spinner-container"} visible={true}>
      <Spin className={"application-spinner"} indicator={<LoadingOutlined spin />} />
    </Portal>
  );
};

export default ApplicationSpinner;

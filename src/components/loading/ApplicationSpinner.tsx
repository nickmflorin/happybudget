import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { Portal } from "components/layout";

interface ApplicationSpinnerProps {
  visible: boolean;
}

const ApplicationSpinner = ({ visible }: ApplicationSpinnerProps): JSX.Element => {
  return (
    <Portal id={"application-spinner-container"} visible={true}>
      <Spin
        className={"application-spinner"}
        style={{ opacity: visible === true ? 1 : 0 }}
        indicator={<LoadingOutlined spin />}
      />
    </Portal>
  );
};

export default ApplicationSpinner;

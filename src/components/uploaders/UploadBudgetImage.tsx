import classNames from "classnames";
import Uploader, { UploaderProps } from "./Uploader";

const UploadBudgetImage = (props: UploaderProps): JSX.Element => {
  return <Uploader {...props} className={classNames("budget-image-uploader", props.className)} showClear={true} />;
};

export default UploadBudgetImage;

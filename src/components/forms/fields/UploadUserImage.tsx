import classNames from "classnames";
import Uploader, { UploaderProps } from "./Uploader";

const UploadUserImage = (props: UploaderProps): JSX.Element => {
  return <Uploader {...props} className={classNames("user-image-uploader", props.className)} />;
};

export default UploadUserImage;

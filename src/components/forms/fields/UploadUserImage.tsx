import classNames from "classnames";
import Uploader, { UploaderProps } from "./Uploader";
import "./UploadUserImage.scss";

const UploadUserImage = (props: UploaderProps): JSX.Element => {
  return <Uploader {...props} className={classNames("user-image-uploader", props.className)} />;
};

export default UploadUserImage;

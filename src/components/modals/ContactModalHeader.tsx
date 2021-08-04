import { UploadUserImage } from "components/uploaders";
import { UploadUserImageProps } from "components/uploaders/UploadUserImage";

interface ContactModalHeaderProps extends StandardComponentProps, UploadUserImageProps {}

const ContactModalHeader = (props: ContactModalHeaderProps): JSX.Element => {
  return (
    <div className={"contact-modal-header"}>
      <UploadUserImage {...props} imageClearButtonProps={{ style: { top: -15, right: -15 } }} />
      <div className={"contact-name-wrapper"}>
        <div className={"contact-name"}>{props.firstName}</div>
        <div className={"contact-name"}>{props.lastName}</div>
      </div>
    </div>
  );
};

export default ContactModalHeader;

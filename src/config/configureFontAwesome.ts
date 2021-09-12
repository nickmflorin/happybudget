import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/pro-solid-svg-icons";
import { far } from "@fortawesome/pro-regular-svg-icons";
import { fal } from "@fortawesome/pro-light-svg-icons";

const configureFontAwesome = () => {
  /* eslint-disable no-console */
  console.log("Configuring Font Awesome");
  library.add(fas, far, fal);
};

export default configureFontAwesome;

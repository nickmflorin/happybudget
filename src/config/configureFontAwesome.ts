import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/pro-solid-svg-icons";
import { far } from "@fortawesome/pro-regular-svg-icons";
import { fal } from "@fortawesome/pro-light-svg-icons";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { IconPack } from "@fortawesome/fontawesome-common-types";

const configureFontAwesome = () => {
  console.info("Configuring Font Awesome");
  library.add(fas, far, fal, fab as IconPack);
};

export default configureFontAwesome;

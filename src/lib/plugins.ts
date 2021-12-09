import moment from "moment-timezone";
import Cookies from "universal-cookie";
import { isNil } from "lodash";

const cookies = new Cookies();

const parseLastIdentifiedUser = (): number | null => {
  const lastIdentifiedUser = cookies.get("lastIdentifiedCannyUser");
  if (typeof lastIdentifiedUser === "string") {
    const userId = parseInt(lastIdentifiedUser);
    if (!isNaN(userId)) {
      return userId;
    }
  }
  return null;
};

const parseDurationSinceLastIdentify = (user: Model.User): number | null => {
  const lastIdentifiedTime = cookies.get("lastIdentifiedCannyTime");
  const now = moment();
  const mmt = moment.tz(lastIdentifiedTime, user.timezone);
  if (mmt.isValid()) {
    const duration = moment.duration(now.diff(mmt));
    return duration.minutes();
  }
  return null;
};

/**
 * Uses the Canny SDK to associate the currently logged in user.
 *
 * Canny's API has certain rate limits, and we want to avoid hitting those.
 * The most relevant one is that we cannot send a request to identify a user
 * more than 1 time in 5 minutes, so we make sure that we haven't identified
 * the same user more than 1 time in 6 minutes to be safe.
 *
 * @param user  The currently logged in user.
 */
export const identifyCanny = (user: Model.User) => {
  const userId = parseLastIdentifiedUser();
  const delta = parseDurationSinceLastIdentify(user);
  if (!isNil(userId) && !isNil(delta) && delta > 6) {
    /* We do not want to makes calls to Canny's API in local development by
       default. */
    if (!isNil(process.env.REACT_APP_CANNY_APP_ID)) {
      window.Canny("identify", {
        appID: process.env.REACT_APP_CANNY_APP_ID,
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name,
          avatarURL: user.profile_image?.url,
          created: new Date(user.date_joined).toISOString()
        }
      });
      cookies.set("lastIdentifiedCannyUser", user.id);
      cookies.set("lastIdentifiedCannyTime", moment().toISOString());
    } else if (process.env.NODE_ENV === "production") {
      console.warn(
        `Could not identify Canny user as ENV variable 'REACT_APP_CANNY_APP_ID'
				is not defined.`
      );
    }
  }
};

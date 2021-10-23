import ReactDOM from "react-dom";

import "style/index.scss";

import App from "./app";
import configureApplication from "./config";
import { history } from "./store";

/*
Note:

At some point, we need to wrap <App /> in <React.StrictMode>.

<React.StrictMode> serves the following purposes:

1. Identifying components with unsafe lifecycles
2. Warning about legacy string ref API usage
3. Warning about deprecated findDOMNode usage
4. Detecting unexpected side effects
5. Detecting legacy context API

However, the warnings about deprecated findDOMNode usage are coming up quite
often due to external third-party packages not being completely React 17
compliant yet.  In order to avoid these unnecessary and frequent warnings,
we temporarily remove <React.StrictMode> until these third-party packages
have a chance to address these warnings.

The most frequent package that causes the warnings is AntD.
*/
configureApplication(history, () => {
  ReactDOM.render(<App history={history} />, document.getElementById("root"));
});

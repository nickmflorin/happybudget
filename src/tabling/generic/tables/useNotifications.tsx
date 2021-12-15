import { useMemo, useRef } from "react";
import ReactDOM from "react-dom";
import { isNil } from "lodash";

import TableNotification from "./TableNotification";

const useNotifications = (id: string): [() => void, (n: TableNotification) => void] => {
  const currentContainer = useRef<HTMLDivElement | null>(null);

  const removeNotification = useMemo(
    () => () => {
      if (currentContainer.current !== null) {
        currentContainer.current.remove();
      }
    },
    [id]
  );

  const notify = useMemo(
    () => (notification: TableNotification) => {
      const element = document.getElementById(`${id}-data`);

      /* Each <Grid /> component has as it's first and only child a <div>
			   element that just sets <div style={{height: 100%}} />.  Since the
			   <Grid /> component itself has the relative positioning, we want to
			   insert the notification container immediately before the child
				 <div />. */
      const tableWrapper = element?.firstChild;
      if (!isNil(tableWrapper) && !isNil(element)) {
        /* We must insert a container element into the DOM that we can render the
			   <TableNotification /> component inside of. */
        const container = document.createElement("div");
        container.setAttribute("style", "position: absolute; bottom: 30px; left: 30px; z-index: 10000");
        currentContainer.current = container;

        element.insertBefore(container, tableWrapper);

        // Render the <TableNotification /> component in the DOM.
        ReactDOM.render(<TableNotification {...notification} />, container);

        if (notification.duration !== undefined) {
          setTimeout(() => {
            removeNotification();
          }, notification.duration);
        }
      }
    },
    [id, removeNotification]
  );

  return [removeNotification, notify];
};

export default useNotifications;

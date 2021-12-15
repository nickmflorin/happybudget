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
      const dataGrid = document.getElementById(`${id}-data`);

      const createContainer = (offset: number) => {
        /* We must insert a container element into the DOM that we can render the
			   <TableNotification /> component inside of. */
        const container = document.createElement("div");
        container.setAttribute("style", `position: absolute; bottom: ${offset}px; left: ${offset}px; z-index: 10000`);
        currentContainer.current = container;
        return container;
      };

      const insertContainer = (): HTMLElement | null => {
        if (!isNil(dataGrid)) {
          /* The height of the table header is 40px (we add an extra 2px to
					   account for slight variations).  If the Data Grid element has a
						 height that is less than 42px, this means that there are no rows
						 in the table.  This can happen if there is an error with the initial
						 request to load the table data.

						 In this case, rendering the notification on top of the data grid
						 does not look right, so we instead render it in the white space
						 underneath the entire "core-table" component.

						  <div class="table ag-theme-alpine">
						    <div id=<tableId> class="core-table">
							    <div id=<tableId>-"data" class="grid--data">
                    ...
										--> Insert Notification Here if Data
							    </div>
							    <div id=<tableId>-"footer" class="grid--table-footer">
							      ...
							    </div>
						    </div>
								--> Insert Notification Here if No Data
						    <div id=<tableId>-"page" class="grid--page-footer">
							    ...
							  </div>
						  </div>
					    */
          if (dataGrid.clientHeight < 42) {
            const coreTable = document.getElementById(id);
            if (!isNil(coreTable)) {
              if (!isNil(coreTable.parentNode)) {
                const container = createContainer(10);
                coreTable.parentNode.insertBefore(container, null);
                return container;
              }
              return null;
            } else {
              console.warn(
                `Element with ID ${id} is not present in the DOM so we cannot
								attach notifications to it.`
              );
              return null;
            }
          } else {
            /* Each <Grid /> component has as it's first and only child a <div>
							 element that just sets <div style={{height: 100%}} />.  Since the
							 <Grid /> component itself has the relative positioning, we want to
							 insert the notification container immediately before the child
							 <div />. */
            const tableWrapper = dataGrid.firstChild;
            if (!isNil(tableWrapper)) {
              const container = createContainer(30);
              dataGrid.insertBefore(container, tableWrapper);
              return container;
            } else {
              console.warn(
                `<div> element that wraps the AG Grid table is not present in the DOM
								so we cannot attach notifications to it.`
              );
              return null;
            }
          }
        } else {
          console.warn(
            `Element with ID ${id}-data is not present in the DOM so we cannot
						attach notifications to it.`
          );
          return null;
        }
      };

      const container = insertContainer();
      if (!isNil(container)) {
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

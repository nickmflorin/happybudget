import { useDispatch, useSelector } from "react-redux";
import { includes, map } from "lodash";

import { redux } from "lib";
import {
  createCommentAction,
  requestCommentsAction,
  deleteCommentAction,
  updateCommentAction,
  requestAccountsHistoryAction
} from "../../../store/actions/budget/accounts";
import CommentsHistoryDrawer from "../CommentsHistoryDrawer";

const selectDeletingComments = redux.selectors.simpleDeepEqualSelector((state: Modules.ApplicationStore) =>
  map(state.budget.budget.budget.comments.deleting, (instance: Redux.ModelListActionInstance) => instance.id)
);
const selectEditingComments = redux.selectors.simpleDeepEqualSelector((state: Modules.ApplicationStore) =>
  map(state.budget.budget.budget.comments.updating, (instance: Redux.ModelListActionInstance) => instance.id)
);
const selectReplyingComments = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.comments.replying
);
const selectCommentsData = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.comments.data
);
const selectSubmittingComment = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.comments.creating
);
const selectLoadingComments = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.comments.loading
);
const selectLoadingHistory = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.history.loading
);
const selectHistory = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.budget.history.data
);

const AccountCommentsHistory = (): JSX.Element => {
  const dispatch = useDispatch();
  const deletingComments = useSelector(selectDeletingComments);
  const editingComments = useSelector(selectEditingComments);
  const replyingComments = useSelector(selectReplyingComments);
  const submittingComment = useSelector(selectSubmittingComment);
  const loadingComments = useSelector(selectLoadingComments);
  const comments = useSelector(selectCommentsData);
  const loadingHistory = useSelector(selectLoadingHistory);
  const history = useSelector(selectHistory);

  return (
    <CommentsHistoryDrawer
      commentsProps={{
        comments: comments,
        loading: loadingComments,
        submitting: submittingComment,
        commentLoading: (comment: Model.Comment) =>
          includes(editingComments, comment.id) ||
          includes(deletingComments, comment.id) ||
          includes(replyingComments, comment.id),
        onRequest: () => dispatch(requestCommentsAction(null)),
        onSubmit: (payload: Http.CommentPayload) => dispatch(createCommentAction({ data: payload })),
        onDoneEditing: (comment: Model.Comment, value: string) =>
          dispatch(updateCommentAction({ id: comment.id, data: { text: value } })),
        onDoneReplying: (comment: Model.Comment, value: string) =>
          dispatch(createCommentAction({ parent: comment.id, data: { text: value } })),
        /* eslint-disable no-console */
        onLike: (comment: Model.Comment) => console.log(comment),
        onDelete: (comment: Model.Comment) => dispatch(deleteCommentAction(comment.id))
      }}
      historyProps={{
        history,
        loading: loadingHistory,
        onRequest: () => dispatch(requestAccountsHistoryAction(null))
      }}
    />
  );
};

export default AccountCommentsHistory;

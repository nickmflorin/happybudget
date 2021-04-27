import { useDispatch, useSelector } from "react-redux";
import { includes, map } from "lodash";

import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import CommentsHistoryDrawer from "../CommentsHistoryDrawer";
import {
  createCommentAction,
  requestCommentsAction,
  deleteCommentAction,
  updateCommentAction,
  requestAccountsHistoryAction
} from "../../../store/actions/budget/accounts";

const selectDeletingComments = simpleDeepEqualSelector((state: Redux.ApplicationStore) =>
  map(state.budget.budget.comments.deleting, (instance: Redux.ModelListActionInstance) => instance.id)
);
const selectEditingComments = simpleDeepEqualSelector((state: Redux.ApplicationStore) =>
  map(state.budget.budget.comments.updating, (instance: Redux.ModelListActionInstance) => instance.id)
);
const selectReplyingComments = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.budget.comments.replying
);
const selectCommentsData = simpleDeepEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.budget.comments.data
);
const selectSubmittingComment = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.budget.comments.creating
);
const selectLoadingComments = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.budget.comments.loading
);
const selectLoadingHistory = simpleShallowEqualSelector(
  (state: Redux.ApplicationStore) => state.budget.accounts.history.loading
);
const selectHistory = simpleDeepEqualSelector((state: Redux.ApplicationStore) => state.budget.accounts.history.data);

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
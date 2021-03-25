import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";

import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import CommentsHistoryDrawer from "../../CommentsHistoryDrawer";
import {
  submitBudgetCommentAction,
  requestBudgetCommentsAction,
  deleteBudgetCommentAction,
  editBudgetCommentAction,
  requestAccountsHistoryAction
} from "../actions";

const selectDeletingComments = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.accounts.comments.deleting
);
const selectEditingComments = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.accounts.comments.editing
);
const selectReplyingComments = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.accounts.comments.editing
);
const selectCommentsData = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.accounts.comments.data
);
const selectSubmittingComment = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.accounts.comments.submitting
);
const selectLoadingComments = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.accounts.comments.loading
);
const selectLoadingHistory = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.accounts.history.loading
);
const selectHistory = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.accounts.history.data
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
        commentLoading: (comment: IComment) =>
          includes(editingComments, comment.id) ||
          includes(deletingComments, comment.id) ||
          includes(replyingComments, comment.id),
        onRequest: () => dispatch(requestBudgetCommentsAction()),
        onSubmit: (payload: Http.ICommentPayload) => dispatch(submitBudgetCommentAction({ data: payload })),
        onDoneEditing: (comment: IComment, value: string) =>
          dispatch(editBudgetCommentAction({ id: comment.id, data: { text: value } })),
        onDoneReplying: (comment: IComment, value: string) =>
          dispatch(submitBudgetCommentAction({ parent: comment.id, data: { text: value } })),
        onLike: (comment: IComment) => console.log(comment),
        onDelete: (comment: IComment) => dispatch(deleteBudgetCommentAction(comment.id))
      }}
      historyProps={{
        history,
        loading: loadingHistory,
        onRequest: () => dispatch(requestAccountsHistoryAction())
      }}
    />
  );
};

export default AccountCommentsHistory;

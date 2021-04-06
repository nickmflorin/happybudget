import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";

import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import CommentsHistoryDrawer from "../CommentsHistoryDrawer";
import {
  requestCommentsAction,
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
  requestHistoryAction
} from "../store/actions/account";

const selectDeletingComments = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.comments.deleting
);
const selectEditingComments = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.comments.updating
);
const selectReplyingComments = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.comments.replying
);
const selectCommentsData = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.comments.data
);
const selectSubmittingComment = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.comments.creating
);
const selectLoadingComments = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.comments.loading
);
const selectLoadingHistory = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.subaccounts.history.loading
);
const selectHistory = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.account.subaccounts.history.data
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
        onRequest: () => dispatch(requestCommentsAction()),
        onSubmit: (payload: Http.ICommentPayload) => dispatch(createCommentAction({ data: payload })),
        onDoneEditing: (comment: IComment, value: string) =>
          dispatch(updateCommentAction({ id: comment.id, data: { text: value } })),
        onDoneReplying: (comment: IComment, value: string) =>
          dispatch(createCommentAction({ parent: comment.id, data: { text: value } })),
        onLike: (comment: IComment) => console.log(comment),
        onDelete: (comment: IComment) => dispatch(deleteCommentAction(comment.id))
      }}
      historyProps={{
        history,
        loading: loadingHistory,
        onRequest: () => dispatch(requestHistoryAction())
      }}
    />
  );
};

export default AccountCommentsHistory;

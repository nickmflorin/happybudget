import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import CommentsHistoryDrawer from "../CommentsHistoryDrawer";
import {
  requestCommentsAction,
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
  requestSubAccountsHistoryAction
} from "../store/actions/subAccount";

const selectDeletingComments = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.comments.deleting
);
const selectEditingComments = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.comments.updating
);
const selectReplyingComments = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.comments.replying
);
const selectCommentsData = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.comments.data
);
const selectSubmittingComment = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.comments.creating
);
const selectLoadingComments = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.comments.loading
);
const selectLoadingHistory = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.subaccounts.history.loading
);
const selectHistory = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.budget.subaccount.subaccounts.history.data
);

const SubAccountCommentsHistory = (): JSX.Element => {
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
          includes(deletingComments, comment.id) ||
          includes(editingComments, comment.id) ||
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
        history: history,
        loading: loadingHistory,
        onRequest: () => dispatch(requestSubAccountsHistoryAction())
      }}
    />
  );
};

export default SubAccountCommentsHistory;

import { useDispatch, useSelector } from "react-redux";
import { includes } from "lodash";
import { simpleDeepEqualSelector, simpleShallowEqualSelector } from "store/selectors";
import CommentsHistoryDrawer from "../../CommentsHistoryDrawer";
import {
  requestSubAccountCommentsAction,
  submitSubAccountCommentAction,
  deleteSubAccountCommentAction,
  editSubAccountCommentAction,
  requestSubAccountSubAccountsHistoryAction
} from "../actions";

const selectDeletingComments = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.comments.deleting
);
const selectEditingComments = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.comments.editing
);
const selectReplyingComments = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.comments.editing
);
const selectCommentsData = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.comments.data
);
const selectSubmittingComment = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.comments.submitting
);
const selectLoadingComments = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.comments.loading
);
const selectLoadingHistory = simpleShallowEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.history.loading
);
const selectHistory = simpleDeepEqualSelector(
  (state: Redux.IApplicationStore) => state.calculator.subaccount.subaccounts.history.data
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
        onRequest: () => dispatch(requestSubAccountCommentsAction()),
        onSubmit: (payload: Http.ICommentPayload) => dispatch(submitSubAccountCommentAction({ data: payload })),
        onDoneEditing: (comment: IComment, value: string) =>
          dispatch(editSubAccountCommentAction({ id: comment.id, data: { text: value } })),
        onDoneReplying: (comment: IComment, value: string) =>
          dispatch(submitSubAccountCommentAction({ parent: comment.id, data: { text: value } })),
        onLike: (comment: IComment) => console.log(comment),
        onDelete: (comment: IComment) => dispatch(deleteSubAccountCommentAction(comment.id))
      }}
      historyProps={{
        history: history,
        loading: loadingHistory,
        onRequest: () => dispatch(requestSubAccountSubAccountsHistoryAction())
      }}
    />
  );
};

export default SubAccountCommentsHistory;

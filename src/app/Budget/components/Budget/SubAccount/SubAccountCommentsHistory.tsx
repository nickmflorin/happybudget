import { useDispatch, useSelector } from "react-redux";
import { includes, map } from "lodash";

import { redux } from "lib";
import { actions } from "../../../store";
import CommentsHistoryDrawer from "../../CommentsHistoryDrawer";

const selectDeletingComments = redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) =>
  map(state.budget.subaccount.comments.deleting, (instance: Redux.ModelListActionInstance) => instance.id)
);
const selectEditingComments = redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) =>
  map(state.budget.subaccount.comments.updating, (instance: Redux.ModelListActionInstance) => instance.id)
);

const selectReplyingComments = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.subaccount.comments.replying
);
const selectCommentsData = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.subaccount.comments.data
);
const selectSubmittingComment = redux.selectors.simpleShallowEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.subaccount.comments.creating
);
const selectLoadingComments = redux.selectors.simpleShallowEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.subaccount.comments.loading
);
const selectLoadingHistory = redux.selectors.simpleShallowEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.subaccount.history.loading
);
const selectHistory = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.subaccount.history.data
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
        commentLoading: (comment: Model.Comment) =>
          includes(deletingComments, comment.id) ||
          includes(editingComments, comment.id) ||
          includes(replyingComments, comment.id),
        onRequest: () => dispatch(actions.subAccount.requestCommentsAction(null)),
        onSubmit: (payload: Http.CommentPayload) => dispatch(actions.subAccount.createCommentAction({ data: payload })),
        onDoneEditing: (comment: Model.Comment, value: string) =>
          dispatch(actions.subAccount.updateCommentAction({ id: comment.id, data: { text: value } })),
        onDoneReplying: (comment: Model.Comment, value: string) =>
          dispatch(actions.subAccount.createCommentAction({ parent: comment.id, data: { text: value } })),
        /* eslint-disable no-console */
        onLike: (comment: Model.Comment) => {},
        onDelete: (comment: Model.Comment) => dispatch(actions.subAccount.deleteCommentAction(comment.id))
      }}
      historyProps={{
        history: history,
        loading: loadingHistory,
        onRequest: () => dispatch(actions.subAccount.requestHistoryAction(null))
      }}
    />
  );
};

export default SubAccountCommentsHistory;

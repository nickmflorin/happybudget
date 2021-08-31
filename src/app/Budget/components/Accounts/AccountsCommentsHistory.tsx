import { useDispatch, useSelector } from "react-redux";
import { includes, map } from "lodash";

import { redux } from "lib";
import { actions } from "../../store";
import CommentsHistoryDrawer from "../CommentsHistoryDrawer";

const selectDeletingComments = redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) =>
  map(state.budget.comments.deleting, (instance: Redux.ModelListActionInstance) => instance.id)
);
const selectEditingComments = redux.selectors.simpleDeepEqualSelector((state: Application.Authenticated.Store) =>
  map(state.budget.comments.updating, (instance: Redux.ModelListActionInstance) => instance.id)
);
const selectReplyingComments = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.comments.replying
);
const selectCommentsData = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.comments.data
);
const selectSubmittingComment = redux.selectors.simpleShallowEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.comments.creating
);
const selectLoadingComments = redux.selectors.simpleShallowEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.comments.loading
);
const selectLoadingHistory = redux.selectors.simpleShallowEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.history.loading
);
const selectHistory = redux.selectors.simpleDeepEqualSelector(
  (state: Application.Authenticated.Store) => state.budget.history.data
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
        onRequest: () => dispatch(actions.accounts.requestCommentsAction(null)),
        onSubmit: (payload: Http.CommentPayload) => dispatch(actions.accounts.createCommentAction({ data: payload })),
        onDoneEditing: (comment: Model.Comment, value: string) =>
          dispatch(actions.accounts.updateCommentAction({ id: comment.id, data: { text: value } })),
        onDoneReplying: (comment: Model.Comment, value: string) =>
          dispatch(actions.accounts.createCommentAction({ parent: comment.id, data: { text: value } })),
        /* eslint-disable no-console */
        onLike: (comment: Model.Comment) => console.log(comment),
        onDelete: (comment: Model.Comment) => dispatch(actions.accounts.deleteCommentAction(comment.id))
      }}
      historyProps={{
        history,
        loading: loadingHistory,
        onRequest: () => dispatch(actions.accounts.requestHistoryAction(null))
      }}
    />
  );
};

export default AccountCommentsHistory;

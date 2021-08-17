import { useDispatch, useSelector } from "react-redux";
import { includes, map } from "lodash";

import { redux } from "lib";
import { actions } from "../../../store";
import CommentsHistoryDrawer from "../CommentsHistoryDrawer";

const selectDeletingComments = redux.selectors.simpleDeepEqualSelector((state: Modules.Authenticated.Store) =>
  map(state.budget.budget.subaccount.comments.deleting, (instance: Redux.ModelListActionInstance) => instance.id)
);
const selectEditingComments = redux.selectors.simpleDeepEqualSelector((state: Modules.Authenticated.Store) =>
  map(state.budget.budget.subaccount.comments.updating, (instance: Redux.ModelListActionInstance) => instance.id)
);

const selectReplyingComments = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.subaccount.comments.replying
);
const selectCommentsData = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.subaccount.comments.data
);
const selectSubmittingComment = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.subaccount.comments.creating
);
const selectLoadingComments = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.subaccount.comments.loading
);
const selectLoadingHistory = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.subaccount.history.loading
);
const selectHistory = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.Authenticated.Store) => state.budget.budget.subaccount.history.data
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
        onRequest: () => dispatch(actions.budget.subAccount.requestCommentsAction(null)),
        onSubmit: (payload: Http.CommentPayload) =>
          dispatch(actions.budget.subAccount.createCommentAction({ data: payload })),
        onDoneEditing: (comment: Model.Comment, value: string) =>
          dispatch(actions.budget.subAccount.updateCommentAction({ id: comment.id, data: { text: value } })),
        onDoneReplying: (comment: Model.Comment, value: string) =>
          dispatch(actions.budget.subAccount.createCommentAction({ parent: comment.id, data: { text: value } })),
        /* eslint-disable no-console */
        onLike: (comment: Model.Comment) => console.log(comment),
        onDelete: (comment: Model.Comment) => dispatch(actions.budget.subAccount.deleteCommentAction(comment.id))
      }}
      historyProps={{
        history: history,
        loading: loadingHistory,
        onRequest: () => dispatch(actions.budget.subAccount.requestHistoryAction(null))
      }}
    />
  );
};

export default SubAccountCommentsHistory;

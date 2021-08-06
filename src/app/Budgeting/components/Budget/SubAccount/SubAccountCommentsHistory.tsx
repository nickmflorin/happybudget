import { useDispatch, useSelector } from "react-redux";
import { includes, map } from "lodash";

import { redux } from "lib";
import {
  requestCommentsAction,
  createCommentAction,
  deleteCommentAction,
  updateCommentAction,
  requestHistoryAction
} from "../../../store/actions/budget/subAccount";
import CommentsHistoryDrawer from "../CommentsHistoryDrawer";

const selectDeletingComments = redux.selectors.simpleDeepEqualSelector((state: Modules.ApplicationStore) =>
  map(state.budget.budget.subaccount.comments.deleting, (instance: Redux.ModelListActionInstance) => instance.id)
);
const selectEditingComments = redux.selectors.simpleDeepEqualSelector((state: Modules.ApplicationStore) =>
  map(state.budget.budget.subaccount.comments.updating, (instance: Redux.ModelListActionInstance) => instance.id)
);

const selectReplyingComments = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.comments.replying
);
const selectCommentsData = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.comments.data
);
const selectSubmittingComment = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.comments.creating
);
const selectLoadingComments = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.comments.loading
);
const selectLoadingHistory = redux.selectors.simpleShallowEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.history.loading
);
const selectHistory = redux.selectors.simpleDeepEqualSelector(
  (state: Modules.ApplicationStore) => state.budget.budget.subaccount.history.data
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
        history: history,
        loading: loadingHistory,
        onRequest: () => dispatch(requestHistoryAction(null))
      }}
    />
  );
};

export default SubAccountCommentsHistory;

import produce from 'immer';
import { get as _get } from 'lodash'
import * as actionTypes from 'store/actionTypes';


export function getInitialState() {
    return {
        Task: null,
        setTaskLoading: null,
        createTaskLoading: null,
        draftTaskLoading: null,
        editTaskLoading: null,
        editDraftTaskLoading: null,
        convertDraftTaskLoading: null,
        archiveTaskLoading: null,
        deleteTaskLoading: null,
        applyTaskLoading: null,
        submitTaskLoading: null,
        assignTaskLoading: null,
        rejectTaskMemberLoading: null,
        rejectTaskSubmissionLoading: null,
    };
}

const TaskReducer = (state: any = getInitialState(), action: any) =>
    produce(state, (draft: any) => {
        const { payload } = action;
        switch (action.type) {

            case actionTypes.SET_TASK_LOADING: {
                draft.setTaskLoading = payload;
                break;
            }

            case actionTypes.SET_TASK_ACTION: {
                draft.Task = payload;
                break;
            }

            case actionTypes.CREATE_TASK_LOADING: {
                draft.createTaskLoading = payload;
                break;
            }

            case actionTypes.DRAFT_TASK_LOADING: {
                draft.draftTaskLoading = payload;
                break;
            }

            case actionTypes.EDIT_TASK_LOADING: {
                draft.editTaskLoading = payload;
                break;
            }

            case actionTypes.EDIT_DRAFT_TASK_LOADING: {
                draft.editDraftTaskLoading = payload;
                break;
            }

            case actionTypes.CONVERT_DRAFT_TASK_LOADING: {
                draft.convertDraftTaskLoading = payload;
                break;
            }

            case actionTypes.ARCHIVE_TASK_LOADING: {
                draft.archiveTaskLoading = payload;
                break;
            }

            case actionTypes.DELETE_TASK_LOADING: {
                draft.deleteTaskLoading = payload;
                break;
            }

            case actionTypes.APPLY_TASK_LOADING: {
                draft.applyTaskLoading = payload;
                break;
            }

            case actionTypes.SUBMIT_TASK_LOADING: {
                draft.submitTaskLoading = payload;
                break;
            }

            case actionTypes.ASSIGN_TASK_LOADING: {
                draft.assignTaskLoading = payload;
                break;
            }

            case actionTypes.REJECT_TASK_MEMBER_LOADING: {
                draft.rejectTaskMemberLoading = payload;
                break;
            }

            case actionTypes.REJECT_TASK_SUBMISSION_LOADING: {
                draft.rejectTaskSubmissionLoading = payload;
                break;
            }
			case actionTypes.LOGOUT_ACTION: {
				draft = getInitialState()
			}
        }
    });

export default TaskReducer;

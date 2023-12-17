import produce from 'immer';
import { get as _get } from 'lodash'
import * as actionTypes from 'store/actionTypes';


export function getInitialState() {
	return {
		DAOLoading: false,
		DAOListLoading: false,
		DAO: null,
		DAOList: null,
		updateDAOLoading: null,
		addSingleMemberLoading: null,
		addMultiMemberLoading: null,
		editDaoMemberLoading: null,
		updateDaoMembersLoading: null,
		syncTrelloDataLoading: null,
		storeGithubIssuesLoading: null,
		deSyncGithubLoading: null,
		deSyncDiscordLoading: null,
		deSyncTrelloLoading: null,
	};
}

const DAOReducer = (state: any = getInitialState(), action: any) =>
	produce(state, (draft: any) => {
		const { payload } = action;
		switch (action.type) {
			case actionTypes.LOAD_DAOLIST_SUCCESS: {
				draft.DAOList = payload;
				draft.DAOListLoading = false
				break;
			}
			case actionTypes.LOAD_DAOLIST_LOADING: {
				draft.DAOListLoading = payload;
				break;
			}
			case actionTypes.SET_DAO_ACTION:
			case actionTypes.LOAD_DAO_SUCCESS: {
				draft.DAO = {
					...payload,
					safes: payload.safes.map((safe:any) => {
						return {
							...safe,
							enabled: !payload?.disabledSafes ? true : (payload?.disabledSafes && payload?.disabledSafes.indexOf(safe?.address) > -1) ? false : true
						}
					})
				};
				draft.DAOLoading = false
				break;
			}
			case actionTypes.UPDATE_DAO_LOADING: {
				draft.updateDAOLoading = payload
				break;
			}
			case actionTypes.LOAD_DAO_LOADING: {
				draft.DAOLoading = payload;
				break;
			}
			case actionTypes.SET_DAO_MEMBER_ACTION: {
				draft.DAO = {
					...(draft.DAO ? draft.DAO : {}),
					members: _get(draft, 'DAO.members', []).map((member: any) => {
						if (member.member._id === payload._id)
							return { ...member, member: payload };
						return member;
					})
				}
				break;
			}
			case actionTypes.SET_DAO_OPTION_ACTION: {
				draft.DAO = { ...draft.DAO, options: payload };
				break;
			}
			case actionTypes.RESET_DAO_ACTION: {
				draft.DAO = null;
				draft.DAOLoading = false
				break;
			}
			case actionTypes.ADD_SINGLE_MEMBER_LOADING: {
				draft.addSingleMemberLoading = payload;
				break;
			}
			case actionTypes.ADD_MULTI_MEMBER_LOADING: {
				draft.addMultiMemberLoading = payload;
				break;
			}
			case actionTypes.EDIT_DAO_MEMBER_LOADING: {
				draft.editDaoMemberLoading = payload;
				break;
			}
			case actionTypes.UPDATE_DAO_MEMBERS_LOADING: {
				draft.updateDaoMembersLoading = payload;
				break;
			}
			case actionTypes.SYNC_TRELLO_DATA_LOADING: {
				draft.syncTrelloDataLoading = payload;
				break;
			}
			case actionTypes.STORE_GITHUB_ISSUES_LOADING: {
				draft.storeGithubIssuesLoading = payload;
				break;
			}
			case actionTypes.DESYNC_GITHUB_LOADING: {
				draft.deSyncGithubLoading = payload;
				break;
			}
			case actionTypes.DESYNC_DISCORD_LOADING: {
				draft.deSyncDiscordLoading = payload;
				break;
			}
			case actionTypes.DESYNC_TRELLO_LOADING: {
				draft.deSyncTrelloLoading = payload;
				break;
			}
			case actionTypes.LOGOUT_ACTION: {
				draft = getInitialState()
			}
		}
	});

export default DAOReducer;

import * as actionTypes from '../actionTypes'

export const loadDAOListAction = () => {
    return {
        type: actionTypes.LOAD_DAOLIST_ACTION
    }
}

export const resetDAOAction = () => {
    return {
        type: actionTypes.RESET_DAO_ACTION
    }
}

export const loadDAOAction = (payload: string | null) => {
    return {
        type: actionTypes.LOAD_DAO_ACTION,
        payload
    }
}

export const setDAOAction = (payload: any) => {
    return {
        type: actionTypes.SET_DAO_ACTION,
        payload
    }
}

export const setDAOMemberAction = (payload: any) => {
    return {
        type: actionTypes.SET_DAO_ACTION,
        payload
    }
}

export const setDAOTagOptionsAction = (payload: any) => {
    return {
        type: actionTypes.SET_DAO_OPTION_ACTION,
        payload
    }
}

export const updateDAOAction = (payload: any) => {
    return {
        type: actionTypes.UPDATE_DAO_ACTION,
        payload
    }
}

export const addDAOMemberAction = (payload: any) => {
    return {
        type: actionTypes.ADD_DAO_MEMBER_ACTION,
        payload
    }
}

export const addSingleMemberAction = (payload: any) => {
    return {
        type: actionTypes.ADD_SINGLE_MEMBER_ACTION,
        payload
    }
}

export const addMultiMemberAction = (payload: any) => {
    return {
        type: actionTypes.ADD_MULTI_MEMBER_ACTION,
        payload
    }
}

export const editDaoMemberAction = (payload: any) => {
    return {
        type: actionTypes.EDIT_DAO_MEMBER_ACTION,
        payload
    }
}

export const updateDaoMembersAction = (payload: any) => {
    return {
        type: actionTypes.UPDATE_DAO_MEMBERS_ACTION,
        payload
    }
}

export const syncTrelloDataAction = (payload: any) => {
    return {
        type: actionTypes.SYNC_TRELLO_DATA_ACTION,
        payload
    }
}

export const storeGithubIssuesAction = (payload: any) => {
    return {
        type: actionTypes.STORE_GITHUB_ISSUES_ACTION,
        payload
    }
}

export const deSyncGithubAction = (payload: any) => {
    return {
        type: actionTypes.DESYNC_GITHUB_ACTION,
        payload
    }
}

export const deSyncDiscordAction = (payload: any) => {
    return {
        type: actionTypes.DESYNC_DISCORD_ACTION,
        payload
    }
}

export const deSyncTrelloAction = (payload: any) => {
    return {
        type: actionTypes.DESYNC_TRELLO_ACTION,
        payload
    }
}

export const toggleSafeAction = (payload: any) => {
    return {
        type: actionTypes.TOGGLE_SAFE_ACTION,
        payload
    }
}

export const updateUserOnboardingCountAction = (payload: any) => {
    return {
        type: actionTypes.UPDATE_USER_ONBOARDING_COUNT_ACTION,
        payload
    } 
}
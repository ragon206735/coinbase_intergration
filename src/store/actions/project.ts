import * as actionTypes from '../actionTypes';

export const getProjectAction = (payload: string) => {
    return {
        type: actionTypes.GET_PROJECT_ACTION,
        payload
    }
}

export const createProjectAction = (payload: any) => {
    return {
        type: actionTypes.CREATE_PROJECT_ACTION,
        payload
    }
}

export const updateProjectDetailsAction = (payload: any) => {
    return {
        type: actionTypes.UPDATE_PROJECT_DETAILS_ACTION,
        payload
    }
}

export const archiveProjectAction = (payload: any) => {
    return {
        type: actionTypes.ARCHIVE_PROJECT_ACTION,
        payload
    }
}

export const deleteProjectAction = (payload: any) => {
    return {
        type: actionTypes.DELETE_PROJECT_ACTION,
        payload
    }
}

export const updateProjectKraAction = (payload: any) => {
    return {
        type: actionTypes.UPDATE_PROJECT_KRA_ACTION,
        payload
    }
}

export const editProjectKraAction = (payload: any) => {
    return {
        type: actionTypes.EDIT_PROJECT_KRA_ACTION,
        payload
    }
}

export const editProjectMilestonesAction = (payload: any) => {
    return {
        type: actionTypes.EDIT_PROJECT_MILESTONES_ACTION,
        payload
    }
}

export const updateProjectMembersAction = (payload: any) => {
    return {
        type: actionTypes.UPDATE_PROJECT_MEMBERS_ACTION,
        payload
    }
}

export const inviteProjectMembersAction = (payload: any) => {
    return {
        type: actionTypes.INVITE_PROJECT_MEMBERS_ACTION,
        payload
    }
}

export const updateMilestoneAction = (payload: any) => {
    return {
        type: actionTypes.UPDATE_MILESTONE_ACTION,
        payload
    }
}

export const updateProjectLinkAction = (payload: any) => {
    return {
        type: actionTypes.UPDATE_PROJECT_LINK_ACTION,
        payload
    }
}

export const editProjectLinksAction = (payload: any) => {
    return {
        type: actionTypes.EDIT_PROJECT_LINK_ACTION,
        payload
    }
}

export const updateProjectViewAction = (payload: any) => {
    return {
        type: actionTypes.UPDATE_PROJECT_VIEW_ACTION,
        payload
    }
}
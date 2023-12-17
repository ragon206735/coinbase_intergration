import axiosHttp from 'api';

export const getProjectService = (params: any) => {
    return axiosHttp.get(`project/${params}`);
}

export const createProjectService = (params: any) => {
    return axiosHttp.post(`project`, params);
}

export const updateProjectDetailsService = (params: any) => {
    return axiosHttp.patch(`project/${params.projectId}/update-project?daoUrl=${params.daoUrl}`, params.payload);
}

export const archiveProjectService = (params: any) => {
    return axiosHttp.patch(`project/${params.projectId}/archive?daoUrl=${params.daoUrl}`);
}

export const deleteProjectService = (params: any) => {
    return axiosHttp.patch(`project/${params.projectId}/delete?daoUrl=${params.daoUrl}`);
}

export const updateProjectKraService = (params: any) => {
    return axiosHttp.patch(`project/${params.projectId}/update-kra?daoUrl=${params.daoUrl}`, params.payload);
}

export const editProjectKraService = (params: any) => {
    return axiosHttp.patch(`project/${params.projectId}/edit-kra?daoUrl=${params.daoUrl}`, params.payload);
}

export const editProjectMilestonesService = (params: any) => {
    return axiosHttp.patch(`project/${params.projectId}/edit-milestones?daoUrl=${params.daoUrl}`, params.payload);
}

export const updateProjectMembersService = (params: any) => {
    return axiosHttp.patch(`project/${params.projectId}/edit-members`, params.payload);
}

export const inviteProjectMembersService = (params: any) => {
    return axiosHttp.patch(`project/${params.projectId}/update-member`, params.payload);
}

export const updateMilestoneService = (params: any) => {
    return axiosHttp.patch(`project/${params.projectId}/update-milestones?daoUrl=${params.daoUrl}`, params.payload)
}

export const updateProjectLinkService = (params: any) => {
    return axiosHttp.patch(`project/${params.projectId}/update-link?daoUrl=${params.daoUrl}`, params.payload)
}

export const editProjectLinkService = (params: any) => {
    return axiosHttp.patch(`project/${params.projectId}/edit-links?daoUrl=${params.daoUrl}`, params.payload)
}

export const updateProjectViewService = (params: any) => {
    return axiosHttp.patch(`project/${params.projectId}/updateView?daoUrl=${params.daoUrl}`)
}
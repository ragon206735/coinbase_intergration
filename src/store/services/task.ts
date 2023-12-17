import axiosHttp from 'api';

export const getTaskService = (params: any) => {
    return axiosHttp.get(`task/${params}`);
}

export const createTaskService = (params: any) => {
    return axiosHttp.post(`task`, params);
}

export const draftTaskService = (params: any) => {
    return axiosHttp.post(`task/draft`, params);
}

export const editTaskService = (params: any) => {
    return axiosHttp.patch(`task/${params.taskId}/edit?daoUrl=${params.daoUrl}`, params.payload);
}

export const editDraftTaskService = (params: any) => {
    return axiosHttp.patch(`task/${params.taskId}/editDraft?daoUrl=${params.daoUrl}`, params.payload);
}

export const convertDraftTaskService = (params: any) => {
    return axiosHttp.patch(`task/${params.taskId}/convertDraft?daoUrl=${params.daoUrl}`, params.payload);
}

export const archiveTaskService = (params: any) => {
    return axiosHttp.patch(`task/${params.taskId}/archive?daoUrl=${params.daoUrl}`);
}

export const deleteTaskService = (params: any) => {
    return axiosHttp.patch(`task/${params.taskId}/delete?daoUrl=${params.daoUrl}`);
}

export const applyTaskService = (params: any) => {
    return axiosHttp.patch(`task/${params.taskId}/apply?daoUrl=${params.daoUrl}`, params.payload);
}

export const submitTaskService = (params: any) => {
    return axiosHttp.patch(`task/${params.taskId}/submit?daoUrl=${params.daoUrl}`, params);
}

export const assignTaskService = (params: any) => {
    return axiosHttp.patch(`task/${params.taskId}/assign?daoUrl=${params.daoUrl}`, params.payload);
}

export const rejectTaskMemberService = (params: any) => {
    return axiosHttp.patch(`task/${params.taskId}/reject-member?daoUrl=${params.daoUrl}`, params.payload);
}

export const rejectTaskSubmissionService = (params: any) => {
    return axiosHttp.post(`task/${params.taskId}/reject?daoUrl=${params.daoUrl}`, params.payload);
}
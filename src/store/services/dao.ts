import axiosHttp from 'api';

export const loadDAOListService = () => {
    return axiosHttp.get('dao')
}

export const loadDAOService = (daoURL: string) => {
    const mint = window.location.href.includes('mint')
    return axiosHttp.get(`dao/${daoURL}?mint=${mint}`)
}

export const updateDAOService = (params: any) => {
    return axiosHttp.patch(`dao/${params.url}/update-details`, params.payload)
}

export const addDAOMemberService = (params: any) => {
    return axiosHttp.patch(`dao/${params.url}/add-member`, params.payload)
}

export const addSingleMemberService = (params: any) => {
    return axiosHttp.patch(`dao/${params.url}/add-member`, params.payload)
}

export const addMultiMemberService = (params: any) => {
    return axiosHttp.patch(`dao/${params.url}/add-member-list`, params.payload)
}

export const editDaoMemberService = (params: any) => {
    return axiosHttp.patch(`member`, params.payload)
}
export const updateDaoMembersService = (params: any) => {
    return axiosHttp.patch(`dao/${params.url}/manage-member`, params.payload)
}

export const syncTrelloDataService = (params: any) => {
    return axiosHttp.post(`utility/sync-trello-data`, params.payload)
}

export const storeGithubIssuesService = (params: any) => {
    return axiosHttp.post(`utility/store-issues`, params.payload)
}

export const deSyncGithubService = (params: any) => {
    return axiosHttp.post(`utility/desync-github`, params.payload)
}

export const deSyncDiscordService = (params: any) => {
    return axiosHttp.post(`utility/desync-discord`, params.payload)
}

export const deSyncTrelloService = (params: any) => {
    return axiosHttp.post(`utility/desync-trello`, params.payload)
}

export const toggleSafeService = (payload: any) => {
    return axiosHttp.post(`dao/${payload.url}/toggle-safe-state`, payload.params)
}

export const updateUserOnboardingCountService = (payload: any) => {
    return axiosHttp.post(`member/update-onboarding-count`, payload)
}
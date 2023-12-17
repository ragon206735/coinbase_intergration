import axiosHttp from 'api';

export const createAccountService = (payload: any) => {
    return axiosHttp.post(`auth/create-account`, {
        name: payload?.userInfo?.name,
        email: payload?.userInfo?.email
    }, { headers: { Authorization: payload.token } })
}

export const updateAccountService = (payload: any) => {
    return axiosHttp.patch(`auth/me`, payload)
}

export const loadUserTransactionService = (payload: any) => {
    return axiosHttp.get(`/gnosis-safe/transactions/${payload}`, payload)
}
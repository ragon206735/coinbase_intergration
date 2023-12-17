import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axiosHttp from 'api'

export default () => {
    
    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        const accountId = searchParams.get("accountId")
        if(accountId) {
            axiosHttp.get(`payment/onboard-refresh?accountId=${accountId}`)
            .then(res => {
                window.location.href = res?.data?.url
            })
        }
    }, [searchParams])
    
    return (
        <div></div>
    )
}
import React, { useState, useEffect } from 'react';
import { get as _get } from 'lodash'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { LeapFrog } from "@uiball/loaders";
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { Box } from '@mui/material';
import axiosHttp from 'api'
import { toast } from 'react-hot-toast';
import usePopupWindow from 'hooks/usePopupWindow';
import { USDC_POLYGON } from 'constants/tokens';



export default ({ open, onClose, onSuccess } : { open: any, onClose: any, onSuccess: any }) => {

    const { onOpen, windowInstance } = usePopupWindow()

    const [paymentResponse, setPaymentResponse] = useState<any>(null);

    const [options, setOptions] = useState<any>(null)

    useEffect(() => {
        if(!open) 
            setOptions(null)
    }, [open])

    const waitFor = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

    const retry = (promise: any, onRetry: any, maxRetries: number) => {
        const retryWithBackoff: any = async (retries: number) => {
            try {
                if (retries > 0) {
                    //const timeToWait = 2 ** retries * 1000;
                    const timeToWait = 10000;
                    console.log(`waiting for ${timeToWait}ms...`);
                    await waitFor(timeToWait);
                }
                return await promise();
            } catch (e) {
                if (retries < maxRetries) {
                    onRetry();
                    return retryWithBackoff(retries + 1);
                } else {
                    console.warn("Max retries reached. Bubbling the error up");
                    throw e;
                }
            }
        }
        return retryWithBackoff(0);
    }

    const getPaymentStatus = async (ref: string) => {
        const onRampResp = await axiosHttp.get(`mint-payment/external-payment-status?ref=${ref}`).then(res => res.data)
        if(onRampResp && onRampResp?.response){
            if(onRampResp?.response?.status === 'pending') {
                throw "Payment verification pending. Please try again"
            }
            return onRampResp?.response
        }
        throw "Payment verification pending. Please try again"
    }

    useEffect(() => {
        if(paymentResponse) {
            let pr = {...paymentResponse}
            setPaymentResponse(null);
            if(open?.provider === 'stripe') {
                if(windowInstance)
                    windowInstance?.close()
            }
            onSuccess({...pr, txnReference: open?.provider === 'stripe' ? pr?.client_reference_id : pr?.partnerContext, tokenId: open?.tokenId })
        }
    }, [windowInstance, paymentResponse, open])
    
    useEffect(() => {
        if(open) {
            setPaymentResponse(null)
            axiosHttp.post(`mint-payment/external-payment-ref?provider=${open?.provider}`, {})
            .then(async (res) => {
                let options = {}
                if(open?.provider === 'stripe') {
                    options = { 
                        client_reference_id: res?.data?._id,
                        ...( open?.email ? { prefilled_email : open.email } : {} ),
                        ...( open?.discountCode ? { prefilled_promo_code : open.discountCode } : {} )
                    }
                    onOpen(`${open?.paymentLink}${getQueryString(options)}`)
                } else if (open?.provider === 'on-ramper') {
                    console.log("OPENNN", open)
                    options = {
                        apiKey: process?.env?.REACT_APP_ONRAMPER_KEY,
                        supportSell: false,
                        isAmountEditable: false,
                        isAddressEditable: false,
                        defaultCrypto: `${open?.token}_POLYGON`,
                        onlyCryptoNetworks: "POLYGON",
                        defaultFiat: 'USD',
                        onlyCryptos: `${open?.token}_POLYGON`,
                        onlyFiat: 'USD',
                        defaultAmount: open?.amount,
                        onlyPaymentMethods: "CREDITCARD",
                        networkWallets: `POLYGON:${_get(open, 'treasury')}`,
                        // onlyGateways: 'ITEZ',
                        partnerContext: res?.data?._id,
                        primaryColor: "c94b32ff"
                    }
                }
                setOptions(options)
                const response = await retry(
                    () => getPaymentStatus(res?.data?._id),
                    () => { console.log('retry called...') },
                    1000
                )
                if(response?.status === "completed" || response?.status === "complete") {
                    setPaymentResponse(response)
                } else if (response?.status === "failed") {
                    toast.error('Payment failed. Please check email for more details.');
                    onClose()
                }
            })
            .catch(e => {
                console.log(e)
                toast.error('Payment failed. Please try again');
                onClose()
            })
        }
    }, [open])

    const getQueryString = (params: any = {}) => {
        if(Object.keys(params).length == 0) return ''
        return `?${Object.keys(params).map(key => key + '=' + params[key]).join('&')}`;
    }

    if(open && open?.provider === 'stripe') {
        return <React.Fragment></React.Fragment>
    }

    return (
        <Dialog
            open={open}
            onClose={(e, reason) => {
                if(reason !== "backdropClick")
                    onClose()
            }}
            disableEscapeKeyDown
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogContent sx={{ height: 650, width: 420 }}>
                {
                    options ? 
                    <iframe
                        style={{ margin: 'auto', border: '1px solid #00000000' }}
                        src={`${open?.paymentLink}${getQueryString(options)}`}
                        height="100%"
                        width="100%"
                        title="Onramper widget"
                        allow="accelerometer; autoplay; camera; gyroscope; payment">
                    </iframe> : 
                    <Box height={650} display="flex" flexDirection="row" alignItems="center" justifyContent="center">
                        <LeapFrog size={50} color="#C94B32" />
                    </Box>
                } 
            </DialogContent>
        </Dialog>
    )
}
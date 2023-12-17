import React, { useCallback, useState } from "react";
import { debounce as _debounce } from 'lodash'
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import axiosHttp from 'api'
import {Elements} from '@stripe/react-stripe-js';
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';
import Button from "components/Button";
import { Box, FormLabel } from "@mui/material";
import Label from "pages/Dashboard/Treasury/components/Label";
import { useParams } from "react-router-dom";

const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

export default ({ open, onClose, onSuccess }: any) => {
    const stripe = useStripe();
    const elements = useElements();
    const [payLoading, setPayLoading] = useState<boolean>(false)
    const { contractId = undefined } = useParams()

  const handleRequiredCardAction = async(data: any) => {
        if (!stripe || !elements) {
            return;
        }
        if (data.requiresAction && data.clientSecret) {
        const { error, paymentIntent } = await stripe.handleCardAction(data.clientSecret);
        console.log("handleCardAction", paymentIntent, error)
        if (error) {
            console.log(error)
        } else {
            const { data } = await axiosHttp.post(`payment/initiate/${contractId}`, { payment_intent_id: paymentIntent?.id }) 
            console.log(data)
            setPayLoading(false)
            onSuccess({ txnReference: data?.txReference, tokenId: open?.tokenId })
        }
        }
    }

    const handleSubmit = async (event: any) => {
        event.preventDefault();
        if (!stripe || !elements) {
            return;
        }
        try {
            setPayLoading(true)
            const billing = {
                name: open?.name,
                email: open?.email || `${open?.name.trim().toLowerCase().replace(" ", '_')}@yopmail.com`
            }
            //@ts-ignore
            const { paymentMethod, error } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
                billing_details: billing
            });
            console.log("paymentMethod", paymentMethod)
            if(error)
                return
            if(paymentMethod){
                const { data } = await axiosHttp.post(`payment/initiate/${contractId}`, { tokenId: open?.tokenId, amount: open?.amount.toFixed(2), email: billing?.email, name: billing?.name, payment_method_id: paymentMethod?.id, save_card: false }) 
                if (data && data.clientSecret && data.requiresAction){
                    handleRequiredCardAction(data)
                } else if (data.success) {
                    console.log(data)
                    setPayLoading(false)
                    onSuccess({ txnReference: data?.txReference, tokenId: open?.tokenId })
                }
            }
        } catch (e) {
            console.log(e)
            setPayLoading(false)
        }
    }

    return (
        <Dialog
            open={Boolean(open)}
            onClose={(e, reason) => {
                if(reason !== "backdropClick")
                    onClose()
            }}
            disableEscapeKeyDown
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogContent sx={{ width: 420 }}>
            <form onSubmit={handleSubmit}>
                <FormLabel>Card</FormLabel>
                <Box sx={{ my: 4 }}>
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                </Box>
                <Box sx={{ my: 1 }} display="flex" flexDirection="row">
                    <Button onClick={() => onClose()} style={{ marginRight: 6 }} size="small" color="primary" variant="outlined" fullWidth disabled={!stripe}>Cancel</Button>
                    <Button loading={payLoading} style={{ marginLeft: 6 }} type="submit" size="small" color="primary" variant="contained" fullWidth disabled={!stripe || payLoading}>Pay</Button>
                </Box>
            </form>
            </DialogContent>
        </Dialog>
    )
}
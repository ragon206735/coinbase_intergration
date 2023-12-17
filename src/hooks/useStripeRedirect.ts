import { randomBytes } from "crypto"
import { capitalize } from "utils";
import usePopupWindow from "../hooks/usePopupWindow"
import { useEffect, useState } from "react"
import { nanoid } from "@reduxjs/toolkit";
import useLocalStorage from "./useLocalStorage";
import axiosHttp from 'api'


const processDiscordError = (error: any): any => ({
  title: capitalize(error.error.replaceAll("_", " ")),
  description: error.errorDescription,
})

type Auth = {
  accessToken: string
  tokenType: string
  expires: number
  authorization: string
}


const useStripeRedirect = () => {
  // prettier-ignore
  const { onOpen, windowInstance } = usePopupWindow()
  const [error, setError] = useState<any>(null)
  const [account, setAccount] = useState<any>(null)


  /** On a window creation, we set a new listener */
  useEffect(() => {
    if (!windowInstance) return

    const popupMessageListener = async (event: MessageEvent) => {
      /**
       * Conditions are for security and to make sure, the expected messages are
       * being handled (extensions are also communicating with message events)
       */
      if (
        event.isTrusted &&
        event.origin === window.location.origin &&
        typeof event.data === "object" &&
        "type" in event.data &&
        "data" in event.data
      ) {
        const { data, type } = event.data

        switch (type) {
          case "STRIPE_SUCCESS": {
            windowInstance?.close()
            try {
                const response = await axiosHttp.get(`payment/connected-account?accountId=${data?.accountId}`)
                setAccount(response?.data)
            } catch (e) { console.log(e) }
            break;
          }
          case "STRIPE_ERROR":
            setError(data)
            const { title, description } = processDiscordError(data)
            //   toast({ status: "error", title, description })
            break
          default:
            // Should never happen, since we are only processing events that are originating from us
            setError({
              error: "Invalid message",
              errorDescription:
                "Recieved invalid message from authentication window",
            })
        }
      }
    }

    window.addEventListener("message", popupMessageListener)
    return () => window.removeEventListener("message", popupMessageListener)
  }, [windowInstance])

  return {
    error,
    addedStripeAccount: account,
    onOpen: (url: string) => {
      setError(null)
      setAccount(null)
      onOpen(url)
    }
  }
}

export default useStripeRedirect


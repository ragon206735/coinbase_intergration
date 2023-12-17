import React from "react";
import useLocalStorage from "hooks/useLocalStorage"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom";


const FALLBACK_EXPIRITY = 604800

const StripeOnBoardSuccess = () => {
  const navigate = useNavigate();
  const [isUnsupported, setIsUnsupported] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    
    const target = `${window.location.origin}${'/'}`

    const accountId = searchParams.get("accountId")

    window.opener.postMessage(
      {
        type: "STRIPE_SUCCESS",
        data: {
            accountId
        },
      },
      target
    )
  }, [navigate, searchParams])

  return isUnsupported ? <div>Unsupported</div> : <div>Closing the authentication window and taking you back to the site...</div>
}
export default StripeOnBoardSuccess

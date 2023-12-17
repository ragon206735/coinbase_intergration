import React, { useEffect, useState } from 'react'
import { pick as _pick, get as _get } from 'lodash'
import { Web3AuthNoModal } from '@web3auth/no-modal'
import { Navigate } from 'react-router-dom'
import FullScreenLoader from 'components/FullScreenLoader'
import { useAppDispatch } from 'helpers/useAppDispatch'
import { useWeb3Auth } from 'context/web3Auth'
import { useAppSelector } from 'helpers/useAppSelector'
import { DAOProvider } from 'context/dao'

export default (props: any) => {
  const dispatch = useAppDispatch()
  const { account, chainId } = useWeb3Auth()
  const { token, user } = useAppSelector((store: any) => store.session)
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    if (!token && props.private) {
      setAuthenticated(false)
    } else {
      setAuthenticated(true)
    }
  }, [account, token, user, props.private])

  if (authenticated === null && props.private) {
    return <FullScreenLoader />
  } else if (authenticated === false && props.private) {
    if (window.location.pathname !== '/')
      window.location.href = `/login?from=${window.location.pathname}`
    else window.location.href = `/login`
  } else if (token && props.private && (!account || !user)) {
    return <FullScreenLoader />
  } else {
    return props.orRender
  }
}

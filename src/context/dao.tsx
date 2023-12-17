import React, { useEffect, useState } from 'react';
import { get as _get, find as _find } from 'lodash'
import { createContext, useContext } from "react";
import { useParams, useSearchParams } from 'react-router-dom';
import axiosHttp from 'api'
import { useWeb3Auth } from './web3Auth';
import { useAppSelector } from 'helpers/useAppSelector';
import { useNavigate } from 'react-router-dom';
import FullScreenLoader from 'components/FullScreenLoader';
import { useAppDispatch } from 'helpers/useAppDispatch';
import { loadDAOAction, loadDAOListAction, resetDAOAction, updateDAOAction } from 'store/actions/dao';
import useMintSBT from 'hooks/useMintSBT.v2';
import { CHAIN_INFO } from 'constants/chainInfo';
import { createAccountAction, logoutAction, setTokenAction, setUserAction } from 'store/actions/session';
import useRole from 'hooks/useRole';
const { toChecksumAddress } = require('ethereum-checksum-address')

export const DAOContext = createContext<any>({

});

export function useDAO() {
  return useContext(DAOContext);
}

export const DAOProvider = ({ privateRoute = false, children }: any) => {
  const { account, provider } = useWeb3Auth();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const from = searchParams.get("from")
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  //@ts-ignore
  const { token, user } = useAppSelector(store => store.session);
  const { daoURL } = useParams();
  //@ts-ignore
  const { DAO, DAOList } = useAppSelector(store => store?.dao)
  const { myRole } = useRole(DAO, account, undefined)

  const { balanceOf, isNFTMinted } = useMintSBT(DAO?.sbt?.address, DAO?.sbt?.version, +DAO?.sbt?.chainId)

  const loadDAOList = async () => {
    dispatch(loadDAOListAction())
  }

  const updateIsHelpOpen = (status: boolean) => {
    setIsHelpOpen(status)
  }

  const loadDAO = async (url: string) => {
    dispatch(loadDAOAction(url))
  }

  useEffect(() => {
    if (!token && window.location.pathname !== '/login' && window.location.pathname.indexOf('preview') === -1) {
      if (window.location.pathname !== '/')
        window.location.href = `/login?from=${window.location.pathname}`
      else
        window.location.href = `/login`
    }
  }, [token])

  useEffect(() => {
    console.log("loadDAOList", account, token)
    if ((!daoURL || daoURL) && account && token && !DAOList) {
      resetDAO()
      loadDAOList()
      //dispatch(createAccountAction({}))
    }
  }, [account, token, DAOList, daoURL])

  useEffect(() => {
    if (user?._id)
      dispatch(createAccountAction({ token }))
  }, [user?._id])

  useEffect(() => {
    if (DAOList && !daoURL && window.location.pathname === '/') {
      if (DAOList.length > 0) {
        navigate(`/${_get(DAOList, '[0].url')}`)
      }
      else
        // navigate(`/organisation/create`)
        navigate(`/starter`)
    }
  }, [DAOList, from])

  /* useEffect(() => {
    if (provider && account && DAO?.url) {
      if (DAO?.sbt) {
        balanceOf().then(res => {
          console.log("Balance of...", parseInt(res._hex, 16))
          if (parseInt(res._hex, 16) === 1) {

          } else {
            if (!DAO?.sbt?.whitelisted || (DAO?.sbt?.whitelisted && _find(DAO?.members, (member: any) => toChecksumAddress(member.member.wallet) === account))) {
              if (+DAO?.sbt?.version >= 2)
                navigate(`/${DAO?.url}/mint/${DAO?.sbt?.address}`)
              else
                navigate(`/${DAO?.url}/mint/v1/${DAO?.sbt?.address}`)
            } else {
              // NOT WHITELISTED
              navigate(`/${DAO?.url}/only-whitelisted`)
            }
          }
        })
          .catch(e => {
            console.log(e)
          })
      } else {
        if (!_find(DAO?.members, (member: any) => toChecksumAddress(member.member.wallet) === account))
          navigate(`/${DAO?.url}/no-access`)
      }
    }
  }, [DAO?.url, provider, account]) */

  useEffect(() => {
    if (((DAOList && account && token) || window.location.pathname.indexOf('preview') > -1) && daoURL && (!DAO || DAO.url !== daoURL))
      loadDAO(daoURL)
  }, [account, token, daoURL, console, DAOList])

  useEffect(() => {
    if (window.location.pathname.indexOf('attach-safe/new') == -1 && DAO && (!DAO.safes || (DAO.safes && DAO.safes.length == 0))) {
      if(DAO?.members && myRole === 'role1')
        navigate(`/${DAO?.url}/attach-safe/new`, { state: { createFlow: true } })
    }
  }, [DAO?.safes])

  const resetDAO = () => {
    dispatch(resetDAOAction())
  }

  const updateDAO = (payload: any) => {
    dispatch(updateDAOAction(payload))
  }

  const contextProvider = {
    DAO, DAOList, isHelpOpen, resetDAO, updateDAO, loadDAO, updateIsHelpOpen
  };
  return <DAOContext.Provider value={contextProvider}>
    {
      privateRoute && (!DAOList || (daoURL && !DAO)) ? <FullScreenLoader /> : children
    }
  </DAOContext.Provider>;
};
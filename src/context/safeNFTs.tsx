import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
  } from "react";
  import { get as _get, find as _find, uniq as _uniq } from "lodash";
  import axios from "axios";
  import { GNOSIS_SAFE_BASE_URLS, SupportedChainId } from "constants/chains";
  import { CHAIN_INFO } from "constants/chainInfo";
  import axiosHttp from "../api";
  import { useDAO } from "context/dao";
  import { useWeb3Auth } from "context/web3Auth";
  import { useAppSelector } from "helpers/useAppSelector";
  import { setDAOAction } from "store/actions/dao";
  import { useAppDispatch } from "helpers/useAppDispatch";
  
  export const SafeNFTsContext = createContext<any>({
    safeTokens: null,
    tokensInfo: null,
    totalBalance: null,
  });
  
  export function useSafeNFTs(): any {
    return useContext(SafeNFTsContext);
  }
  
  export const SafeNFTsProvider = ({ children }: any) => {
    //@ts-ignore
    const { DAO } = useAppSelector((store) => store?.dao);
    const [safeNFTs, setsafeNFTs] = useState<any>();
    const [safeNFTsInfo, setsafeNFTsInfo] = useState<any>();
  
    //   const dispatch = useAppDispatch();
  
    useEffect(() => {
      if (!DAO) {
        setsafeNFTs(null);
      }
    }, [DAO]);

    useEffect(() => {
      if (!DAO) {
        setsafeNFTsInfo(null);
      }
    }, [DAO]);
  
    const getNFTs = async (
      chain: SupportedChainId,
      safeAddress: String,
      name: String
    ) => {
      return axios
        .get(
          `${GNOSIS_SAFE_BASE_URLS[chain]}/api/v2/safes/${safeAddress}/collectibles/?trusted=false&exclude_spam=false`,
          { withCredentials: false }
        )
        .then((res: any) => {
            let data = {
              [`${safeAddress}`]: res.data,
              chainId: chain,
              address: safeAddress,
              name: name,
            };
            return data;
          
        });
    };

    useEffect(() => {
      if (DAO?.url) {
        Promise.all(
          DAO?.safes?.map((s: any) => getNFTs(s.chainId, s.address, s.name))
        )
          .then(async (res) => {
            console.log(res)
            let tokensInfo: any = {};
            let tokens: any = {};
  
            for (let index = 0; index < res.length; index++) {
              const element = res[index];
              console.log(element)
              tokens[`${Object.keys(element)[0]}`] =
                element[`${Object.keys(element)[0]}`];
              tokensInfo[`${Object.keys(element)[0]}`] = {
                tokens: element[`${Object.keys(element)[0]}`],
                name: element["name"],
                chainId: element["chainId"],
              };
            }
            setsafeNFTs(tokens);
            setsafeNFTsInfo(tokensInfo);

          })
          .catch((e) => console.log(e));
      }
    }, [DAO?.url, DAO?.sweatPoints]);
  
   
  
    const contextProvider = {
      safeNFTs,
      safeNFTsInfo,
      getNFTs,
    };
    return (
      <SafeNFTsContext.Provider value={contextProvider}>
        {children}
      </SafeNFTsContext.Provider>
    );
  };
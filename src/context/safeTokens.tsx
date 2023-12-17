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
  
  export const SafeTokensContext = createContext<any>({
    safeTokens: null,
    tokensInfo: null,
    totalBalance: null
  });
  
  export function useSafeTokens(): any {
    return useContext(SafeTokensContext);
  }
  
  export const SafeTokensProvider = ({ children }: any) => {
    //@ts-ignore
    const { DAO } = useAppSelector((store) => store?.dao);
    const [safeTokens, setSafeTokens] = useState<any>();
    const [safeTokensInfo, setSafeTokensInfo] = useState<any>();
    const [totalBalance, setTotalBalance] = useState<Number>(0);
  
    const dispatch = useAppDispatch();
  
    useEffect(() => {
      if (!DAO) {
        setSafeTokens(null);
      }
    }, [DAO]);
  
    const tokenBalance = (token: any, safeAddress: string) => {
      if (safeTokens) {
        let selToken = _find(
          _get(safeTokens, safeAddress, []),
          (t) => _get(t, "tokenAddress", null) === token
        );
        if (!selToken) return 0;
        return _get(selToken, "balance", 0) / 10 ** (selToken?.token?.decimals || selToken?.token?.decimal);
      }
      return 0;
    };

  
    const getToken = useCallback(
      (tokenAddr: string, safeAddress: string) => {
        if (safeTokens && safeAddress) {
          return _find(
            _get(safeTokens, safeAddress, []),
            (st) => _get(st, "tokenAddress", "0x") === tokenAddr
          );
        }
        return null;
      },
      [safeTokens]
    );

    
  
    const getTokens = async (
      chain: SupportedChainId,
      safeAddress: String,
      name: String
    ) => {
      return axios
        .get(
          `${GNOSIS_SAFE_BASE_URLS[chain]}/api/v1/safes/${safeAddress}/balances/usd/`,
          { withCredentials: false }
        )
        .then(async (res: any) => {
          let tokens = res.data.map((t: any) => {
            let tkn = t;
            if (!tkn.tokenAddress) {
              return {
                ...t,
                tokenAddress: process.env.REACT_APP_NATIVE_TOKEN_ADDRESS,
                token: {
                  symbol: CHAIN_INFO[chain].nativeCurrency.symbol,
                  decimal: CHAIN_INFO[chain].nativeCurrency.decimals,
                  decimals: CHAIN_INFO[chain].nativeCurrency.decimals,
                  logoUri: CHAIN_INFO[chain].logoUrl,
                },
              };
            }
            return t;
          });
          if (DAO.sweatPoints) {
            tokens.push({
              tokenAddress: "SWEAT",
              token: {
                symbol: "SWEAT",
                decimal: 18,
                decimals: 18,
              },
            });
          }
          const safe: any = await axios
            .get(`${GNOSIS_SAFE_BASE_URLS[chain]}/api/v1/safes/${safeAddress}/`, {
              withCredentials: false,
            })
            .then((res) => res.data);
          if (tokens && tokens.length > 0) {
            let total = tokens.reduce((a: any, b: any) => {
              return a + parseFloat(_get(b, "fiatBalance", 0));
            }, 0);
            axiosHttp.post(`/safe/${safeAddress}/sync`, {
              owners: safe?.owners,
              tokens,
              balance: total,
              threshold: safe?.threshold,
            });
          }
          return {
            [`${safeAddress}`]: tokens,
            owners: safe?.owners,
            name: name,
            chainId: chain,
          };
        });
    };
  
    const getTotalBalance = () => {
      let total = 0;
      if (safeTokens) {
        Object.keys(safeTokens).map((key) => {
          safeTokens[key].map((token: any) => {
            if (token.token.symbol !== 'SWEAT')
            {total += parseFloat(token.fiatBalance);}
            
          });
        });
      }
      setTotalBalance(total);
    };
  
    useEffect(() => {
      if (DAO?.url) {
        Promise.all(
          DAO?.safes?.map((s: any) => getTokens(s.chainId, s.address, s.name))
        )
          .then(async (res) => {
            let tokensInfo: any = {};
            let tokens: any = {};
            let owners: any = [];
            for (let index = 0; index < res.length; index++) {
              const element = res[index];
              tokens[`${Object.keys(element)[0]}`] =
                element[`${Object.keys(element)[0]}`];
              tokensInfo[`${Object.keys(element)[0]}`] = {
                tokens: element[`${Object.keys(element)[0]}`],
                name: element["name"],
                chainId: element["chainId"],
              };
              owners = owners.concat(element["owners"]);
            }
            setSafeTokens(tokens);
            setSafeTokensInfo(tokensInfo);
            const { data } = await axiosHttp.patch(
              `dao/${DAO.url}/sync-safe-owners`,
              _uniq(owners)
            );
            dispatch(setDAOAction(data));
          })
          .catch((e) => console.log(e));
      }
    }, [DAO?.url, DAO?.sweatPoints]);
  
    useEffect(() => {
      if (safeTokens) {
        getTotalBalance();
      }
    }, safeTokens);
  
    const contextProvider = {
      safeTokens,
      safeTokensInfo,
      totalBalance,
      tokenBalance,
      getToken,
    };
    return (
      <SafeTokensContext.Provider value={contextProvider}>
        {children}
      </SafeTokensContext.Provider>
    );
  };
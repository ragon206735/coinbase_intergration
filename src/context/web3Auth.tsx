//@ts-nocheck
import React from 'react';
import {  get as _get, find as _find } from 'lodash'
import { ADAPTER_EVENTS, getChainConfig, SafeEventEmitterProvider, WALLET_ADAPTERS, WALLET_ADAPTER_TYPE } from "@web3auth/base";
import { ethers } from "ethers";
import { Web3AuthNoModal } from "@web3auth/no-modal";
import { OpenloginAdapter } from "@web3auth/openlogin-adapter";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import Web3Token from 'web3-token';
// import { NetworkSwitch } from "@web3auth/ui";
import { createContext, FunctionComponent, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { CHAIN_CONFIG, CHAIN_CONFIG_TYPE } from "constants/chainConfig";
import { SupportedChainId, WEB3AUTH_NETWORK, WEB3AUTH_NETWORK_TYPE } from "constants/chains";
import { MetamaskAdapter } from "@web3auth/metamask-adapter";
import { TorusWalletConnectorPlugin } from "@web3auth/torus-wallet-connector-plugin";
import { useAppSelector } from "helpers/useAppSelector";
import { useAppDispatch } from 'helpers/useAppDispatch';
import { logoutAction, setNetworkConfig, setTokenAction, setUserAction } from 'store/actions/session';
import { CHAIN_INFO } from 'constants/chainInfo';

const whiteLabel = {
  name: "Lomads",
  defaultLanguage: "en",
  dark: false
}

export const Web3AuthContext = createContext<any>({
  web3Auth: null,
  provider: null,
  w3Provider: null,
  chainId: null,
  account: null,
  isLoading: false,
  login: async (adapter: WALLET_ADAPTER_TYPE, provider?: any, login_hint?: string) => {},
  logout: async () => {},
  switchChain: async (chainId: string) => {},
});

export function useWeb3Auth() {
  return useContext(Web3AuthContext);
}

interface IWeb3AuthState {
  // web3AuthNetwork: WEB3AUTH_NETWORK_TYPE;
  // chain: CHAIN_CONFIG_TYPE;
  children?: React.ReactNode;
}
interface IWeb3AuthProps {
  children?: ReactNode;
  // web3AuthNetwork: WEB3AUTH_NETWORK_TYPE;
  // chain: CHAIN_CONFIG_TYPE;
}

export const Web3AuthProvider: FunctionComponent<IWeb3AuthState> = ({ children }: IWeb3AuthProps) => {
  const dispatch = useAppDispatch()
  const { web3AuthNetwork = "", chain = ""} = useAppSelector((store:any) => store.session) 
  const [web3Auth, setWeb3Auth] = useState<Web3AuthNoModal | null>(null);
  const [state, setState] = useState<any>({
    w3Provider: null,
    provider: null,
    account: null
  })

  const [isLoading, setIsLoading] = useState(false);

const handleAccountsChanged = async () => {
    try {
      await localStorage.clear()
      sessionStorage.clear()
      dispatch(setTokenAction(null))
      dispatch(setUserAction(null))
      dispatch(logoutAction())
      await logout()
      await localStorage.setItem("MANUAL_DISCONNECT", "true")
    } catch(e) {
      console.log(e)
    }
}

const handleNetworkChanged = async (chainId: any) => {
    try {
      window.location.reload();
    } catch(e) {
      console.log(e)
    }
}

// useEffect(() => {
//   if(window?.ethereum) {
//       let chainInfo = CHAIN_INFO[+_get(window?.ethereum, 'networkVersion', SupportedChainId.POLYGON)]
//       if(!chainInfo)
//         chainInfo = CHAIN_INFO[SupportedChainId.POLYGON]
//       dispatch(setNetworkConfig({ selectedChainId: +_get(window?.ethereum, 'networkVersion', SupportedChainId.POLYGON), chain: chainInfo.chainName, web3AuthNetwork: chainInfo.network }))
//   }
// }, [])

useEffect(() => {
  if(window?.ethereum)
    //@ts-ignore
    window?.ethereum.on('accountsChanged', handleAccountsChanged);
  return () => {
    if(window?.ethereum)
      //@ts-ignore
      window?.ethereum.removeListener('accountsChanged', handleAccountsChanged);
  };
  }, []);

  // useEffect(() => {
  //   if(window?.ethereum)
  //     //@ts-ignore
  //     window?.ethereum.on('networkChanged', handleNetworkChanged);
  //   return () => {
  //     if(window?.ethereum)
  //       //@ts-ignore
  //       window?.ethereum.removeListener('networkChanged', handleNetworkChanged);
  //   };
  //   }, []);

  useEffect(() => {
    const subscribeAuthEvents = (web3auth: Web3AuthNoModal) => {
      // Can subscribe to all ADAPTER_EVENTS and LOGIN_MODAL_EVENTS
      web3auth.on(ADAPTER_EVENTS.CONNECTED, async (data: unknown) => {
        console.log("Yeah!, you are successfully logged in", data);
        if(web3auth && web3auth?.provider) {
          const provider = new ethers.providers.Web3Provider(web3auth?.provider);
          const signer = provider.getSigner();
          const account = await signer.getAddress();
          const { chainId } = await provider.getNetwork()
          setState({
            provider: provider, account: account, chainId, w3Provider: web3auth?.provider
          })
        }
      });

      web3auth.on(ADAPTER_EVENTS.CONNECTING, () => {
        console.log("connecting");
      });

      web3auth.on(ADAPTER_EVENTS.DISCONNECTED, () => {
        console.log("disconnected");
      });

      web3auth.on(ADAPTER_EVENTS.ERRORED, (error: unknown) => {
        console.error("some error or user has cancelled login request", error);
      });
    };

    const privateKeyProvider = new EthereumPrivateKeyProvider({
      config: { chainConfig: _get(CHAIN_CONFIG, chain, 'polygon') },
    });

    async function init() {
      try {
        setIsLoading(true);
        const clientId = _get(WEB3AUTH_NETWORK, `cyan.clientId`)
        console.log("chain, web3AuthNetwork", chain, web3AuthNetwork)
        const web3AuthInstance = new Web3AuthNoModal({
          web3AuthNetwork: 'cyan',
          chainConfig: _get(CHAIN_CONFIG, chain, 'polygon'),
          enableLogging: true,
          clientId: clientId || '',
        });
        subscribeAuthEvents(web3AuthInstance);
        const torusPlugin = new TorusWalletConnectorPlugin({
          torusWalletOpts: { buttonPosition: "bottom-left", },
          walletInitOptions: {
            whiteLabel: {
              theme: { isDark: true, colors: { primary: "#00a8ff" } },
              logoDark: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
              logoLight: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
            },
            useWalletConnect: true,
            enableLogging: true,
          },
        });
      await web3AuthInstance.addPlugin(torusPlugin);
        const adapter = new OpenloginAdapter({ privateKeyProvider, adapterSettings: { whiteLabel } });
        web3AuthInstance.configureAdapter(adapter);
        const metamaskAdapter = new MetamaskAdapter({
          clientId,
          sessionTime: 3600, // 1 hour in seconds
        })
        web3AuthInstance.configureAdapter(metamaskAdapter);
        await web3AuthInstance.init();
        console.log("web3AuthInstance", web3AuthInstance)
        setWeb3Auth(web3AuthInstance);
        if(web3AuthInstance && web3AuthInstance?.provider) {
          const provider = new ethers.providers.Web3Provider(web3AuthInstance?.provider);
          const signer = provider.getSigner();
          const account = await signer.getAddress();
          const { chainId } = await provider.getNetwork()
          setState({
            provider: provider, account: account, chainId, w3Provider: web3AuthInstance?.provider
          })
        } else {
          console.log("window.ethereum", window?.ethereum)
          console.log("web3AuthInstance", "Need to login")
          if(window?.location?.pathname.indexOf('/login') === -1 && window.location.pathname.indexOf('preview') === -1)
            window.location.href = '/login'
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [chain, web3AuthNetwork]);


  const login = async (adapter: WALLET_ADAPTER_TYPE, loginProvider: any, login_hint?: string) => {

    try {
      console.log("web3Auth", web3Auth)
      setIsLoading(true);
      if (!web3Auth) {
        console.log("web3auth not initialized yet");
        return;
      }
      console.log("loginProvider", loginProvider)
      const localProvider = await web3Auth.connectTo(adapter, { loginProvider, login_hint });
      console.log("localProvider", localProvider)
      if(web3Auth?.provider) {
        const provider = new ethers.providers.Web3Provider(web3Auth?.provider);
        const signer = provider.getSigner();
        const account = await signer.getAddress();
        const { chainId } = await provider.getNetwork()
        setState({
          provider: provider, account: account, chainId, w3Provider: web3Auth?.provider
        })
        const token = await Web3Token.sign(async (msg: string) => await signer.signMessage(msg), '365d');
        return token;
      }
      return null
    } catch (error) {
      console.log("error", error);
      // await logout()
      return null
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    try { await web3Auth.logout() } catch (e) {}
    setState({ provider: null, account: null, w3Provider: null});
  };

  const switchChain = async (nextChainId: string) => {
    if (!web3Auth) {
      console.log("web3auth not initialized yet");
      throw "web3auth not initialized yet"
    }
    try { 
      return await web3Auth.switchChain({ chainId: nextChainId }); 
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  const contextProvider = {
    web3Auth,
    provider: state?.provider,
    w3Provider: state?.w3Provider,
    account: state?.account,
    chainId: state?.chainId,
    isLoading,
    login,
    logout,
    switchChain
  };
  return <Web3AuthContext.Provider value={contextProvider}>{children}</Web3AuthContext.Provider>;
};
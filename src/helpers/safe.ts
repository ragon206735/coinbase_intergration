// @ts-nocheck 
import Safe, { EthersAdapter, SafeFactory, SafeAccountConfig  } from '@safe-global/protocol-kit'
import SafeApiKit from '@safe-global/api-kit'
// import Safe from "@gnosis.pm/safe-core-sdk";
// import SafeServiceClient from "@gnosis.pm/safe-service-client";
import { ethers } from "ethers";
import { GNOSIS_SAFE_BASE_URLS } from 'constants/chains'

import { ContractNetworksConfig } from '@safe-global/protocol-kit'

const contractNetworks: ContractNetworksConfig = {
  [8453]: {
    safeMasterCopyAddress: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938',
    safeProxyFactoryAddress: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC',
    multiSendAddress: '0x998739BFdAAdde7C933B942a68053933098f9EDa',
    multiSendCallOnlyAddress: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B',
    fallbackHandlerAddress: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
    signMessageLibAddress: '0x98FFBBF51bb33A056B08ddf711f289936AafF717',
    createCallAddress: '0xB19D6FFc2182150F8Eb585b79D4ABcd7C5640A9d',
  }
  }

export const ImportSafe = async (provider: any, safeAddress: string) => {
  const safeOwner = provider?.getSigner(0);
  console.log("ImportSafe", safeOwner)
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: safeOwner as any,
  });
  console.log("ImportSafe", ethAdapter)
  const safeSDK: Safe = await Safe.create({ethAdapter: ethAdapter, contractNetworks,safeAddress });
  console.log("ImportSafe", provider, safeAddress, safeSDK)
  return safeSDK;
};

export const safeService = async (provider: any, chainId: string) => {
  const safeOwner = provider?.getSigner(0);
  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: safeOwner as any,
  });
  const txServiceUrl = GNOSIS_SAFE_BASE_URLS[chainId];
  const safeService = new SafeApiKit({  txServiceUrl, ethAdapter })
  console.log("safeService", safeService)
  return safeService;
};

import { ethers } from "ethers";
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'

export function beautifyHexToken(token: string): string {
  return (token?.slice(0, 6) + "..." + token?.slice(-4))
}

export const isValidUrl = (urlString: string) => {
  var urlPattern = new RegExp('^(https?:\\/\\/)?' + // validate protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // validate domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // validate OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // validate port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // validate query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // validate fragment locator
  return !!urlPattern.test(urlString);
}

export const isAddressValid = (holderAddress: string) => {
  const ENSdomain = holderAddress.slice(-4);
  if (ENSdomain === ".eth") {
    return true;
  } else {
    const isValid: boolean = ethers.utils.isAddress(holderAddress);
    return isValid;
  }
};

export const isRightAddress = (holderAddress: string) => {
  const isValid: boolean = ethers.utils.isAddress(holderAddress);
  return isValid;
};


// account is not optional
export function getSigner(provider: JsonRpcProvider, account: string): JsonRpcSigner {
  return provider.getSigner(account).connectUnchecked()
}
export const getQueryString = (params: any = {}) => {
  if (Object.keys(params).length == 0) return ''
  return `?${Object.keys(params).map(key => key + '=' + params[key]).join('&')}`;
}


const waitFor = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export const retry = (promise: any, onRetry: any, maxRetries: number) => {
  const retryWithBackoff: any = async (retries: number) => {
    try {
      if (retries > 0) {
        const timeToWait = 2 ** retries * 1000;
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

export const capitalize = (text: string) => {
  if (text.length > 1) {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }
  return text
}

export const sliceAddress = (address: String) => {
  return address.slice(0, 6) + "..." + address.slice(-4);
};
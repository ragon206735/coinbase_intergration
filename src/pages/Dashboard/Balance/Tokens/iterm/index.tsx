import React from "react";
import img from "assets/images/goerli.png";
import token_default from "assets/images/crypto_default.png"
import { sliceAddress } from "utils";

export default function Token({ token }: any) {

  const handleImgError = (e:any) => {
    e.target.src = token_default
  }

  return (
    <div className="px-6 py-2 grid grid-cols-10">
      <div className="col-span-2 text-lg">
        <div className="flex gap-4" style={{display: 'flex',alignItems:'center'}}>
          <img
            src={token.token.logoUri}
            onError={handleImgError}
            alt=""
            className="w-[18px] h-[18px]"
          />
          <div className="leading-0">
            <span className="text-sm" style={{color:'rgb(27, 43, 65)'}}>{token?.token?.symbol}</span>
            <br />
            {/* <span className="text-sm italic text-gray-300 flex">{sliceAddress(token?.tokenAddress)}</span> */}
          </div>
        </div>
      </div>

      <div className="col-span-2 text-sm flex items-center" style={{color:'rgb(27, 43, 65)'}}>$ {token.fiatConversion}</div>
      <div className="col-span-2 text-sm flex items-center" style={{color:'rgb(27, 43, 65)'}}>{token.balance / 10 ** (token.token.decimal ||token.token.decimals)} {token?.token?.symbol}</div>
      <div className="col-span-2 text-sm flex items-center" style={{color:'rgb(27, 43, 65)'}}> $ {token.fiatBalance} </div>
    </div>
  );
}
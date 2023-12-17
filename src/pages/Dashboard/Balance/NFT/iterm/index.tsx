import React from "react";
import img from "assets/images/NFT_default.png";
import { sliceAddress } from "utils";
import Etherscan from "assets/images/Balance/Etherscan.png";
import Opensea from "assets/images/Balance/Opensea.png";
import Zerion from "assets/images/Balance/Zerion.png";
import Blur from "assets/images/Balance/Blur.png";
import colection from "assets/images/link.svg";
import { CHAIN_INFO } from "constants/chainInfo";


export default function NFT({props}:any) {
  console.log(props.token.id)
  const blurLink = `https://blur.io/asset/${props?.token.address}/${props?.token.id}`
  const ethereumLink = `${CHAIN_INFO[props.chainId]?.explorer}${props?.token.address}/${props?.token.id}`
  const zerionLink = `${CHAIN_INFO[props.chainId]?.zerion}${props?.token.address}:${props?.token.id}`
  const openseaLink = `${CHAIN_INFO[props.chainId]?.opensea}${props?.token.address}:${props?.token.id}`
  return (
    <div className="px-6 py-2 grid grid-cols-12">
      <div className="col-span-5 text-lg">
        <div className="flex gap-6" style={{display: 'flex',alignItems:'center'}}>
          <img src={props.token.imageUri ? props.token.imageUri:img} alt="" className="w-[30px] h-[30px] object-cover object-center my-auto" />
          <div className="leading-0">
            <span className="text-sm" style={{color:'rgb(27, 43, 65)'}}>{props.token.tokenName}</span>
            <br />
            <div className="text-sm italic text-gray-300 flex">
              {sliceAddress(props.token.address)}
              &nbsp;&nbsp;&nbsp;&nbsp;
              <a href="/" target={"_blank"}>
                <img src={colection} className="w-[12px]" alt="" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-3 text-sm flex items-center" style={{color:'rgb(27, 43, 65)'}}>{props?.token.name}</div>

      <div className="col-span-4 text-lg font-semibold flex gap-6 items-center">
        <a href={ethereumLink} target="_blank" className="overflow-hidden rounded-full hover:shadow-md shadow-black transition ease-in-out">
          <img src={Etherscan} className="w-[20px] h-[20px]" alt="" />
        </a>
        <a href={openseaLink} target="_blank" className="overflow-hidden rounded-full hover:shadow-md shadow-black transition ease-in-out">
          <img src={Opensea} className="w-[20px] h-[20px]" alt="" />
        </a>
        <a href={zerionLink} target="_blank" className="overflow-hidden rounded-full hover:shadow-md shadow-black transition ease-in-out">
          <img src={Zerion} className="w-[20px] h-[20px]" alt="" />
        </a>
        <a href={blurLink} target="_blank" className="overflow-hidden rounded-full hover:shadow-md shadow-black transition ease-in-out">
          <img src={Blur} className="w-[20px] h-[20px]" alt="" />
        </a>
      </div>
    </div>
  );
}
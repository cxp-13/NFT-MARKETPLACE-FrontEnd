"use client"
import React from "react";
import { useAccount, useWriteContract } from "wagmi";
import { useNotification, Button } from "@web3uikit/core";
import BasicNFTJson from "../constants/BasicNft.json";
import NFTMarketPlaceJson from "../constants/NFTMarketPlace.json";

const MintNft = () => {
  const nftMarketAddr = process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS;
  const nftAddr = process.env.NEXT_PUBLIC_NFT_ADDRESS;
  const { writeContract: mintNft } = useWriteContract();
  const dispatch = useNotification();
  const { address: account, isConnected } = useAccount();

  const handleMint = async () => {
    mintNft(
      {
        abi: BasicNFTJson.abi,
        address: nftAddr as `0x${string}`,
        functionName: "mintNft",
      },
      {
        async onSuccess() {
          dispatch({
            type: "success",
            message: "Mint success!",
            title: "Mint success",
            position: "topR",
          });
        },
        onError(error, variables, context) {
          dispatch({
            type: "error",
            message: `Mint fail`,
            title: "Mint fail",
            position: "topR",
          });
        },
      }
    );
  };

  return (
    <div>
      {isConnected ? (
        <Button onClick={() => handleMint()} text="Button" />
      ) : (
        <p>钱包未连接</p>
      )}
    </div>
  );
};

export default MintNft;

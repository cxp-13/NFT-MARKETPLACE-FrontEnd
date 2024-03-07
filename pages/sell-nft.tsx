import styles from "../styles/Home.module.css";
//@ts-ignore
import { Form, useNotification, Button } from "@web3uikit/core";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useWriteContract,
} from "wagmi";
import { readContract } from "@wagmi/core";
import { config } from "./_app";
import BasicNFTJson from "../constants/BasicNft.json";
import NFTMarketPlaceJson from "../constants/NFTMarketPlace.json";

export default function Home() {
  const nftMarketAddr = process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS;
  const nftAddr = process.env.NEXT_PUBLIC_NFT_ADDRESS;

  const [marketplaceAddress, setMarketPlaceAddress] = useState("");
  const [nftPrice, setNftPrice] = useState("");
  const { address: account, isConnected } = useAccount();

  let chainId = useChainId();
  const dispatch = useNotification();
  const [proceeds, setProceeds] = useState("0");
  // 授权NFT
  const { writeContract: approve } = useWriteContract();
  // 展示NFT
  const { writeContract: listNft } = useWriteContract();
  // 取回售出NFT的全部Token
  const { writeContract: withDrawProceeds } = useWriteContract();

  async function approveAndList(data: any) {
    // { id: string, data: [{inputName: string; inputResult: string[] | string;}]}
    // console.log("Approving...");
    // const nftAddress = data.data[0].inputResult;
    // const tokenId = data.data[1].inputResult;
    // setNftPrice(price);

    let tokenId = data.data[0].inputResult;
    let nftPrice = data.data[1].inputResult;
    nftPrice = ethers.parseUnits(data.data[2].inputResult, "ether");
    // 授权
    approve(
      {
        abi: BasicNFTJson.abi,
        address: nftAddr as `0x${string}`,
        functionName: "approve",
        args: [nftMarketAddr, tokenId],
      },
      {
        onSuccess: () => {
          // 挂单
          handleApproveSuccess(tokenId, nftPrice);
        },
        onError(error, variables, context) {
          console.log("授权onError", error);
        },
        onSettled(data, error, variables, context) {
          console.log("授权onSettled");
        },
      }
    );
  }

  function handleApproveSuccess(tokenId: string, price: string) {
    console.log("Ok! Now time to list");
    listNft(
      {
        abi: NFTMarketPlaceJson.abi,
        address: nftMarketAddr as `0x${string}`,
        functionName: "approve",
        args: [nftAddr, price, tokenId],
      },
      {
        onSuccess: () => {
          handleListSuccess();
        },
      }
    );
  }

  async function handleListSuccess() {
    dispatch({
      type: "success",
      message: "NFT listing",
      title: "NFT listed",
      position: "topR",
    });
  }

  const handleWithdrawSuccess = async () => {
    setProceeds("0");
    dispatch({
      type: "success",
      message: "Withdrawing proceeds",
      position: "topR",
    });
  };

  const fetchProceeds = async () => {
    const result = await readContract(config, {
      abi: NFTMarketPlaceJson.abi,
      address: nftMarketAddr as `0x${string}`,
      functionName: "getProceeds",
      args: [account],
    });
  };

  const handleWithdraw = () => {
    withDrawProceeds({
      abi: NFTMarketPlaceJson.abi,
      address: nftMarketAddr as `0x${string}`,
      functionName: "withDrawProceeds",
    });
  };

  // 获取用户的可以取出的总金额
  useEffect(() => {
    if (isConnected) {
      fetchProceeds();
    } else {
      setProceeds("0");
      dispatch({
        type: "warning",
        message: "Wallet is not connected",
        position: "topR",
      });
    }
  }, [proceeds, account, isConnected, chainId]);

  return (
    <>
      {marketplaceAddress && marketplaceAddress.trim() ? (
        // 授权给NFT市场并且挂出
        <div className={styles.container}>
          <Form
            onSubmit={approveAndList}
            data={[
              {
                name: "Token ID",
                type: "number",
                value: "",
                key: "tokenId",
              },
              {
                name: "Price (in ETH)",
                type: "number",
                value: "",
                key: "price",
              },
            ]}
            title="Sell your NFT!"
            id="Main Form"
          />
          <div>Withdraw {proceeds} ETH proceeds</div>
          {proceeds != "0.0" ? (
            <Button
              onClick={() => {
                handleWithdraw();
              }}
              text="Withdraw"
              type="button"
            />
          ) : (
            <div>No proceeds detected</div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen w-full">
          <div className="text-center text-4xl text-gray-600">
            Temporarily only support Sepolia network,Please switch to Sepolia!
          </div>
        </div>
      )}
    </>
  );
}

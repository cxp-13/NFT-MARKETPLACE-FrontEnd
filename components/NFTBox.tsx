import { useState, useEffect } from "react";

import NFTMarketPlaceJson from "../constants/NFTMarketPlace.json";
import Image from "next/image";
import {
  Card,
  useNotification,
  //@ts-ignore
} from "@web3uikit/core";
import { UpdateListingModal } from "./UpdateListingModal";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWriteContract,
} from "wagmi";
import { ethers } from "ethers";
import api from "@/utils/api";
import config from "@/utils/config";
import BasicNftJson from "../constants/BasicNFT.json";

const truncateStr = (fullStr: string, strLen: number) => {
  if (fullStr.length <= strLen) return fullStr;
  const separator = "...";
  const seperatorLength = separator.length;
  const charsToShow = strLen - seperatorLength;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    fullStr.substring(0, frontChars) +
    separator +
    fullStr.substring(fullStr.length - backChars)
  );
};

export default function NFTBox({
  price,
  nftAddress,
  tokenId,
  seller,
  getListedNfts,
}: {
  price: string;
  nftAddress: `0x${string}`;
  tokenId: number;
  seller: string;
  getListedNfts: Function;
}) {
  let nftAddr = process.env.NEXT_PUBLIC_NFT_ADDRESS;
  let nftMarketAddr = process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS;

  const [imageURI, setImageURI] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenDescription, setTokenDescription] = useState("");
  const [showModal, setShowModal] = useState(false);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const dispatch = useNotification();
  const hideModal = () => setShowModal(false);

  async function updateUI() {
    console.log("chainId", chainId.toString(16));
    console.log("nftAddress", nftAddress);
    const respData = await api.getNFTMetaData(
      nftAddress,
      tokenId.toString(),
      "0x" + chainId.toString(16)
    );
    console.log("获取NFT元数据：respData：", respData);
    const metadata = respData.data.normalized_metadata;
    setImageURI(metadata.image);
    setTokenName(metadata.name);
    setTokenDescription(metadata.description);
  }

  useEffect(() => {
    if (isConnected) {
      updateUI();
    }
  }, [isConnected]);

  const { writeContract: buyItem } = useWriteContract();

  const handleCardClick = async () => {
    console.log(ethers.parseUnits(price, "wei"));
    

    isOwnedByUser
      ? setShowModal(true)
      : buyItem(
          {
            address: nftMarketAddr as `0x${string}`,
            abi: NFTMarketPlaceJson.abi,
            functionName: "buyItem",
            args: [nftAddress, tokenId.toString()],
            value: ethers.parseUnits(price, "wei"),
          },
          {
            async onSuccess() {
              dispatch({
                type: "success",
                message: "Item bought!",
                title: "Item Bought",
                position: "topR",
              });
              await getListedNfts();
            },
            onError(error, variables, context) {
              dispatch({
                type: "error",
                message: `Item bought Fail! ${error}`,
                title: "Item Bought Fail",
                position: "topR",
              });
            },
          }
        );
  };

  const isOwnedByUser =
    seller === address?.toLocaleLowerCase() || seller === undefined;

  const formattedSellerAddress = isOwnedByUser
    ? "you"
    : truncateStr(seller || "", 15);
  return (
    <div>
      <div>
        {imageURI ? (
          <div>
            <UpdateListingModal
              isVisible={showModal}
              tokenId={tokenId}
              nftAddress={nftAddress}
              onClose={hideModal}
              imageURI={imageURI}
              currentPrice={ethers.formatUnits(price, "ether")}
              refreshNftPage={getListedNfts}
            />
            <Card
              title={tokenName}
              description={tokenDescription}
              onClick={handleCardClick}
            >
              <div className="p-2">
                <div className="flex flex-col items-end gap-2">
                  <div>#{tokenId}</div>
                  <div className="italic text-sm">
                    Owned by {formattedSellerAddress}
                  </div>
                  <Image
                    alt={"Owned by " + formattedSellerAddress}
                    loader={() => imageURI}
                    src={imageURI}
                    height="200"
                    width="200"
                  />
                  <div className="font-bold">
                    {ethers.formatUnits(price, "ether")} ETH
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </div>
  );
}

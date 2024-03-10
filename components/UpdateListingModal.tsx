import {
  Modal,
  useNotification,
  Input,
  Illustration,
  Button,
  //@ts-ignore
} from "@web3uikit/core";
import { useState } from "react";
import { ethers } from "ethers";
import Image from "next/image";
import { useAccount, useWriteContract } from "wagmi";
import NFTMarketPlaceJson from "../constants/NFTMarketPlace.json";

export interface UpdateListingProps {
  isVisible: boolean;
  onClose: () => void;
  nftAddress: string;
  tokenId: number;
  imageURI: string | undefined;
  currentPrice?: string | undefined;
  refreshNftPage: Function;
}

export const UpdateListingModal = ({
  isVisible,
  onClose,
  nftAddress,
  tokenId,
  imageURI,
  currentPrice,
  refreshNftPage,
}: UpdateListingProps) => {
  const dispatch = useNotification();
  const { address } = useAccount();
  const [newPrice, setNewPrice] = useState<string | undefined>();
  const nftMarketAddr = process.env.NEXT_PUBLIC_NFT_MARKET_ADDRESS;
  const { writeContract: updateListing } = useWriteContract();
  const { writeContract: cancelListing } = useWriteContract();

  const handleOnOk = async () => {
    updateListing(
      {
        address: nftMarketAddr as `0x${string}`,
        abi: NFTMarketPlaceJson.abi,
        functionName: "updateListing",
        account: address,
        args: [nftAddress, tokenId, ethers.parseEther(newPrice || "0")],
      },
      {
        async onSuccess() {
          dispatch({
            type: "success",
            message: "Listing updated successfully",
            title: "Listing Updated - please refresh",
            position: "topR",
          });
          onClose && onClose();
          setNewPrice("0");
          await refreshNftPage();
        },
        onError(error) {
          console.log("updateListing error:", error);
          dispatch({
            type: "error",
            message: "Listing updated unsuccessfully",
            title: "Listing updated unsuccessfully",
            position: "topR",
          });
        },
      }
    );
  };

  const handleCancel = async () => {
    cancelListing(
      {
        address: nftMarketAddr as `0x${string}`,
        abi: NFTMarketPlaceJson.abi,
        functionName: "cancelListing",
        account: address,
        args: [nftAddress, tokenId],
      },
      {
        async onSuccess() {
          dispatch({
            type: "success",
            message: "Listing canceled successfully",
            title: "Listing Canceled",
            position: "topR",
          });
          onClose && onClose();
          await refreshNftPage();
        },
        onError(error) {
          console.log("cancelListing error:", error);
          dispatch({
            type: "error",
            message: "Listing canceled unsuccessfully",
            title: "Listing canceled unsuccessfully",
            position: "topR",
          });
        },
      }
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      id="regular"
      onCancel={onClose}
      onCloseButtonPressed={onClose}
      onOk={() => handleOnOk()}
      title="NFT Details"
      okText="Save New Listing Price"
      cancelText="Leave it"
      isOkDisabled={!newPrice}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <p className="p-4 text-lg">
            This is your listing. You may either update the listing price or
            cancel it.
          </p>
          <div className="flex flex-col items-end gap-2 border-solid border-2 border-gray-400 rounded p-2 w-fit">
            <div>#{tokenId}</div>
            {imageURI ? (
              <Image
                alt=""
                loader={() => imageURI}
                src={imageURI}
                height="200"
                width="200"
              />
            ) : (
              <Illustration height="180px" logo="lazyNft" width="100%" />
            )}
            <div className="font-bold">{currentPrice} ETH</div>
          </div>
          <Input
            label="Update listing price in L1 Currency (ETH)"
            name="New listing price"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setNewPrice(event.target.value);
            }}
            type="number"
          />
          or
          <Button
            id="cancel-listing"
            onClick={() => handleCancel()}
            text="Cancel Listing"
            theme="colored"
            color="red"
            type="button"
          />
        </div>
      </div>
    </Modal>
  );
};

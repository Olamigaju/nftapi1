import React, { useEffect, useState, useContext, createContext } from "react";
import axios from "axios";

import {
  useAddress,
  useContract,
  useMetamask,
  useDisconnect,
  useSigner,
} from "@thirdweb-dev/react";
import { ethers } from "ethers";

const StateContext = createContext();

export const StateContextProvider = ({ children }) => {
  const { contract } = useContract("");

  const address = useAddress();
  const connect = useMetamask();

  //Frontend

  const disconnect = useDisconnect();
  const signer = useSigner();

  const [userBalance, setUserBlance] = useState();

  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      //Userbalance
      const balance = await signer?.getBalance();
      const userBalance = address
        ? ethers.utils.formatEther(balance?.toString())
        : "";
      setUserBlance(userBalance);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  //Contract Function

  const UploadImage = async (imageInfo) => {
    const { title, description, email, category, image } = imageInfo;
    try {
      //Charges
      const listingPrice = await contract.call("listingrice");

      const createNFTs = await contract.call(
        "uploadIPFS",
        [address, image, description, email, category],
        {
          value: listingPrice.toString(),
        }
      );
      //API CALLq
      const response = await axios({
        method: "POST",
        url: "/api/V1/NFTs",
        data: {
          title: title,
          description: description,
          email: email,
          category: category,
          image: image,
          address: address,
        },
      });
      console.log(response);
      console.info("contract call success", createNFTs);

      setLoading(false);
      window.location.reload();
    } catch (err) {
      console.log(err);
    }
  };
  //  GET COnTRACT DATA
  const getUploadedImages = async () => {
    //Total upload
    const images = await contract.call("getAllNFTs");
    const listimgPrice = await contract.call("listingPrice");
    const allImages = images.map((images) => ({
      owner: images.creator,
      title: images.title,
      description: images.description,
      email: images.email,
      category: images.category,
      fundraised: images.fundraised,
      image: images.image,
      imageID: images.id.toNumber(),
      createdAt: images.timestamp.toNumber(),
      listedAmount: ethers.utils.formatEther(listimgPrice.toString()),
      totalUpload: totalUpload.toNumber(),
    }));

    return allImages;
  };

  //GET SINGLE IMAGE
  const singleImage = async (id) => {
    try {
      const data = await contract.call("getImage", [id]);

      const image = {
        title: data[0],
        description: data[1],
        email: data[2],
        category: data[3],
        fundraised: ethers.utils.formatEther(data[4].toString()),
        creator: data[5],
        imageURL: data[6],
        createdAt: data[7].toNumber(),
        imageId: data[8].toNumber(),
      };
      return image;
    } catch (error) {
      console.log(error);
    }
  };
  //Donate
  const donateFund = async ({ amount, id }) => {
    try {
      const transaction = await contract.call("donateToImage", [id], {
        value: amount.toString(),
      });
      console.log(transaction);
      window.location.reload();
    } catch (error) {
      console.log(error);
    }
  };

  //GET API DATA
  const getAllNftsAPI = async () => {
    const response = await axios({
      method: "GET",
      url: "/api/v1/NFTs",
    });
    //console.log(response)
  };
  //Single
  const getSingleNftsAPI = async (id) => {
    const response = await axios({
      method: "GET",
      url: `/api/v1/NFTs${id}`,
    });
    console.log(response);
  };

  return (
    <StateContext.Provider
      value={{
        //CONTRACT
        address,
        contract,
        connect,
        disconnect,
        userBalance,
        setLoading,
        loading,
        //FUNCTION
        UploadImage,
        getUploadedImages,
        donateFund,
        singleImage,
        //API
        getAllNftsAPI,
        getSingleNftsAPI,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = useContext(StateContext);

import Onboard, { WalletState } from "@subwallet-connect/core";
import injectedModule from "@subwallet-connect/injected-wallets";
import subwalletModule from "@subwallet-connect/subwallet";
import subwalletPolkadotModule from "@subwallet-connect/subwallet-polkadot";
import type { Chain } from "@subwallet-connect/common";
import { useCallback, useState } from "react";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";
import { Keyring } from "@polkadot/keyring";
import { decodeAddress } from "@polkadot/util-crypto";
import { ethers } from "ethers";
import { u8aToHex } from "@polkadot/util";

function getEvmNetworkInfo(): Chain {
  return {
    id: "0xaa36a7",
    label: "Ethereum Sepolia Testnet",
    token: "ETH",
    rpcUrl: "https://rpc.ankr.com/eth_sepolia",
  };
}

const injected = injectedModule();
const subWallet = subwalletModule();
const subWalletP = subwalletPolkadotModule();

const onboard = Onboard({
  wallets: [injected, subWallet, subWalletP],
  chains: [getEvmNetworkInfo()],
  chainsPolkadot: [
    {
      id: "0x91b171bb158e2d3848fa23a9f1c25182fb8e20313b2c1eb49219da7a70ce90c3",
      namespace: "substrate",
      token: "DOT",
      label: "Polkadot",
      rpcUrl: `polkadot.api.subscan.io`,
      decimal: 10,
    },
  ],
});
const ws = "wss://rpc.polkadot.io";

export default function Home() {
  const [wallets, setWallets] = useState<WalletState[]>([]);

  const connect = useCallback(() => {
    onboard
      .connectWallet()
      .then((walletList) => {
        setWallets(walletList);
      })
      .catch(console.error);
  }, []);

  const createWallet = async () => {
    const MNEMONIC =
      "sample split bamboo west visual approve brain fox arch impact relief smile";
    const keyring = new Keyring({ type: "ethereum" });
    const keyring2 = new Keyring({ type: "sr25519" });
    const keyring3 = new Keyring({ type: "ecdsa" });
    const pair = keyring.addFromUri(
      MNEMONIC,
      { name: "first pair" },
      "ethereum"
    );
    const pair2 = keyring2.addFromUri(
      MNEMONIC,
      { name: "second pair" },
      "sr25519"
    );
    const pair3 = keyring3.addFromUri(
      MNEMONIC,
      { name: "third pair" },
      "ecdsa"
    );
    console.log(keyring.decodeAddress(pair.address));
    console.log(keyring.decodeAddress(pair2.address));
    console.log(keyring.decodeAddress(pair3.address));
    console.log(pair.meta.name, "has address", pair.address);
    console.log(pair2.meta.name, "has address", pair2.address);
    console.log(pair3.meta.name, "has address", pair3.address);

    const publicKey = decodeAddress(pair3.address);
    const ethAddress = ethers.utils.computeAddress(publicKey);
    console.log("eth address", ethAddress);
  };

  const sendAction = async () => {
    const actionName = "create";
    try {
      console.log("Sending action");
      const response = await fetch(
        `http://localhost:3000/getEIP712Types/${actionName}`
      );

      const data = await response.json();
      const eip712Types = data.eip712Types;
      console.log(eip712Types);

      const walletAddress = wallets ? wallets[0]?.accounts[0]?.address : null;
      const provider = wallets[0]?.provider;

      const walletClient = createWalletClient({
        chain: sepolia,
        transport: custom(provider),
      });

      const domain = data.domain;
      console.log(domain);

      if (!walletClient) {
        console.log("Wallet client not initialized");
        return;
      }

      if (!walletAddress) {
        return;
      }

      const payload = {
        address: "0xC2baeb8b13cb54aA47dd5b4B63dA3876577b1AD5",
      };
      console.log(payload);

      const signature = await walletClient.signTypedData({
        account: wallets[0].accounts[0].address as `0x${string}`,
        domain: domain,
        primaryType: "createAccount",
        types: eip712Types,
        //@ts-ignore
        message: payload,
      });
      console.log("Signing action");

      console.log(`Signature for the create action for rollup : ${signature}`);

      const body = JSON.stringify({
        msgSender: wallets[0].accounts[0].address,
        signature,
        inputs: payload,
      });

      const res = await fetch(`http://localhost:3000/${actionName}`, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Action sent");

      const json = await res.json();
      console.log(`Response: ${JSON.stringify(json, null, 2)}`);
      console.log(json);
    } catch (error) {
      console.log(error);
    }
  };

  const sendAction2 = async () => {
    const actionName = "create";
    const MNEMONIC =
      "sample split bamboo west visual approve brain fox arch impact relief smile";
    const keyring3 = new Keyring({ type: "ecdsa" });
    const pair3 = keyring3.addFromUri(
      MNEMONIC,
      { name: "third pair" },
      "ecdsa"
    );

    console.log(pair3.meta.name, "has address", pair3.address);
    try {
      console.log("Sending action");
      const response = await fetch(
        `http://localhost:3000/getEIP712Types/${actionName}`
      );

      const data = await response.json();
      const eip712Types = data.eip712Types;
      console.log(eip712Types);

      // const walletClient = wallets && wallets[0].signer;
      // const walletAddress = wallets ? wallets[0]?.accounts[0]?.address : null;

      const walletAddress = pair3.address;

      const domain = data.domain;
      console.log(domain);

      // if (!walletClient) {
      //   console.log("Wallet client not initialized");
      //   return;
      // }

      if (!walletAddress) {
        console.log("Wallet address not found");
        return;
      }

      const payload = {
        address: "0xC2baeb8b13cb54aA47dd5b4B63dA3876577b1AD5",
      };
      console.log(payload);

      const publicKey = decodeAddress(walletAddress);
      console.log(publicKey);
      const ethAddress = ethers.utils.computeAddress(publicKey);

      const payloadString = JSON.stringify(payload);
      console.log(payloadString);

      // const signRaw = walletClient.signRaw;
      // console.log(signRaw);
      // if (signRaw) {
      // const { signature } = await signRaw({
      //   address: walletAddress,
      //   data: stringToHex(payloadString),
      //   type: "bytes",
      // });

      // const signature = pair3.sign(stringToHex(payloadString));

      const messageHash = ethers.utils._TypedDataEncoder.hash(
        domain,
        eip712Types,
        payload
      );

      const signature = pair3.sign(messageHash);

      const r = u8aToHex(signature.slice(0, 32));
      const s = u8aToHex(signature.slice(32, 64));
      const v = signature[64] + 27; 

      const ethSignature = {
        r: r,
        s: s,
        v: v,
      };

      console.log("Signing action");

      console.log(`Signature for the create action for rollup : ${JSON.stringify(ethSignature)}`);
      console.log(ethers.utils.joinSignature(ethSignature))

      const body = JSON.stringify({
        msgSender: ethAddress,
        signature: ethers.utils.joinSignature(ethSignature),
        inputs: payload,
      });

      const res = await fetch(`http://localhost:3000/${actionName}`, {
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Action sent");

      const json = await res.json();
      console.log(`Response: ${JSON.stringify(json, null, 2)}`);
      console.log(json);
      // }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <button onClick={connect}>Connect Wallet</button>
      <div>{wallets ? wallets[0]?.accounts[0]?.address : "not connected"}</div>
      <button onClick={sendAction2}>send actions</button>
      <button onClick={createWallet}>create wallet</button>
    </div>
  );
}

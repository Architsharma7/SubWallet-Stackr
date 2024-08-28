import Onboard, { WalletState } from "@subwallet-connect/core";
import injectedModule from "@subwallet-connect/injected-wallets";
import subwalletModule from "@subwallet-connect/subwallet";
import type { Chain } from "@subwallet-connect/common";
import { useCallback, useState } from "react";
import { createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";

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

const onboard = Onboard({
  wallets: [injected, subWallet],
  chains: [getEvmNetworkInfo()],
  chainsPolkadot: [],
});

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

  return (
    <div>
      <button onClick={connect}>Connect Wallet</button>
      <div>{wallets ? wallets[0]?.accounts[0]?.address : "not connected"}</div>
      <button onClick={sendAction}>send actions</button>
    </div>
  );
}

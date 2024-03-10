import type { AppProps } from "next/app";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { http, createConfig, WagmiProvider } from "wagmi";
import { mainnet, sepolia, localhost } from "wagmi/chains";
import "@rainbow-me/rainbowkit/styles.css";
import "../styles/globals.css";
import Header from "@/components/Header";
import Head from "next/head";
//@ts-ignore
import { NotificationProvider } from "@web3uikit/core";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY!;

const config = getDefaultConfig({
  appName: "NFT MarketPlace",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
  chains: [sepolia, localhost],
  transports: {
    [sepolia.id]: http(),
    [localhost.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div>
      <Head>
        <title>NFT Market</title>
        <meta name="description" content="NFT Market"></meta>
        <link rel="icon" href="./favicon.ico"></link>
      </Head>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <NotificationProvider>
              <Header></Header>
              <Component {...pageProps} />{" "}
            </NotificationProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </div>
  );
}

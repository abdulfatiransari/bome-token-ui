import React from "react";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import { ConnectionProvider } from "@solana/wallet-adapter-react";

import "tailwindcss/tailwind.css";
import "../styles/globals.css";
import "../styles/App.css";
import { Toaster } from "views/BurnSPLView/ui/toaster";

// set custom RPC server endpoint for the final website
const endpoint = "https://api.devnet.solana.com";
// const endpoint = "https://solana-mainnet.g.alchemy.com/v2/6IFloFGmrK7SdWIoWYTZBOEqCt8W-BWZ";
// const endpoint = "https://explorer-api.devnet.solana.com";
// const endpoint = "http://127.0.0.1:8899";
// const endpoint = "https://ssc-dao.genesysgo.net";
// const endpoint = "https://solana-api.projectserum.com";
// const endpoint = "https://api.mainnet-beta.solana.com";
// const endpoint = 'https://rpc.ankr.com/solana';
//  const endpoint = "https://rpc.helius.xyz/?api-key=fe8eb42f-5a2c-4b9f-b0e6-92a8e1af948a";
// const endpoint = "https://try-rpc.mainnet.solana.blockdaemon.tech";

const WalletProvider = dynamic(
  () => import("../contexts/ClientWalletProvider"),
  {
    ssr: false,
  }
);

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider>
        <Component {...pageProps} />
        <Toaster />
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;

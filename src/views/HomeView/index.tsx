import Link from "next/link";
import { FC, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { SolanaLogo, ConnectWallet } from "components";
import styles from "./index.module.css";

const walletPublicKey = "";

export const HomeView: FC = ({}) => {
  const { publicKey } = useWallet();
  const [walletToParsePublicKey, setWalletToParsePublicKey] =
    useState<string>(walletPublicKey);

  const onUseWalletClick = () => {
    if (publicKey) {
      setWalletToParsePublicKey(publicKey?.toBase58());
    }
  };

  return (
    <div className="container mx-auto max-w-6xl p-8 2xl:px-0">
      <div className={styles.container}>
        <div className="navbar mb-2 shadow-lg bg-neutral text-neutral-content rounded-box flex justify-around">
          <div className="flex-1 px-2">
            <div className="text-sm breadcrumbs">
              <ul className="text-xs sm:text-xl">
                <li>
                  <Link href="/">Solana Tools</Link>
                </li>
                <li>
                  <Link href="/create">Create Token</Link>
                </li>
                <li>
                  <Link href="/burn">Burn Token</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex-none">
            <WalletMultiButton className="btn btn-ghost" />
            <ConnectWallet onUseWalletClick={onUseWalletClick} />
          </div>
        </div>

        <div className="text-center pt-2">
          <div className="hero min-h-16 py-4">
            <div className="text-center hero-content">
              <div className="max-w-lg">
                <h1 className="mb-5 text-5xl font-bold">
                  Hello Solana <SolanaLogo /> World!
                </h1>
                <p className="mb-2">
                  This website includes amazing tools to help you in the solana
                  ecosystem.
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* <h1 className="mb-2 pb-8 text-5xl">Available tools :</h1> */}
            <ul className="text-left leading-10">
              {/* <li className="mb-5">
                <Link href="/burn-nft">
                  <div className="p-4 hover:border">
                    <a className="text-4xl font-bold mb-5">🔥 -- Burn NFT</Link>
                    <div>A UI to burn Solana NFTs and get SOL back</div>
                  </div>
                </Link>
              </li> */}
              <li>
                <Link href="/burn">
                  <div className="p-4 border border-transparent hover:border-white">
                    <div className="text-4xl font-bold mb-5">
                      🔥 -- Burn SPL token
                    </div>
                    <div>A UI to burn SPL tokens and get SOL back</div>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="/closeaccount">
                  <div className="p-4 border border-transparent hover:border-white">
                    <div className="text-4xl font-bold mb-5">
                      🔒 -- Close empty account
                    </div>
                    <div>
                      A UI to close empty account of unused token and get SOL
                      back
                    </div>
                  </div>
                </Link>
              </li>
              {/* 

              <li className="mb-5">
                <Link href="/revoke">
                  <div className="p-4 border border-transparent hover:border-white">
                    <a className="text-4xl font-bold mb-5">
                      🚫 -- Revoke authority
                    </Link>
                    <div>A UI to view the tokens you have delegated rights to and revoke them </div></div>
                </Link>

              </li> */}
              <li>
                <Link href="/create">
                  <div className="p-4 border border-transparent hover:border-white">
                    <div className="mb-5 text-4xl font-bold">
                      🧪 -- SPL Token Creator
                    </div>
                    <div>A UI to create your own Solana token</div>
                  </div>
                </Link>
              </li>
              {/* <li className="mb-5">
                <Link href="/createNFTcollection">
                  <div className="p-4 hover:border">
                    <a className="mb-5 text-4xl font-bold">
                      🖼️ -- Create NFT Collection
                    </Link>
                    <div>A UI to create and migrate NFTs to a Collection</div>
                  </div>
                </Link>
              </li>
              <li className="mb-5">
                <Link href="/multisender">
                  <div className="p-4 hover:border">
                    <a className="mb-5 text-4xl font-bold">
                      📨 📨 📨  -- Multi Sender
                    </Link>
                    <div>A UI to send multiple tokens in 1 transaction (same token to different people/many tokens to one person)</div>
                  </div>
                </Link>
              </li>
              <li className="mb-5">
                <Link href="/updateNFTmetadata">
                  <div className="p-4 hover:border">
                    <a className="mb-5 text-4xl font-bold">
                      ✍️ -- Update NFT metadata
                    </Link>
                    <div>A UI to update the metadata of your NFT</div>
                  </div>
                </Link>
              </li>
              <li className="mb-5">
                <Link href="/upload">
                  <div className="p-4 hover:border">
                    <a className="mb-5 text-4xl font-bold">
                      📤 -- Upload file
                    </Link>
                    <div>A UI to upload file to Arweave</div>
                  </div>
                </Link>
              </li>
              <li className="mb-5">
                <Link href="/suatmm">
                  <div className="p-4 hover:border">
                    <a className="text-4xl font-bold mb-5">
                      📨 -- Send NFT message
                    </Link>
                    <div>A UI to send a message to the owner of the NFT, the .sol domain name or ANS you want</div>
                  </div>
                </Link>

              </li> */}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

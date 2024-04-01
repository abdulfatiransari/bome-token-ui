import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction } from "@solana/web3.js";
import { FC, useEffect, useState } from "react";

import { Metaplex } from "@metaplex-foundation/js";
import {
  createBurnInstruction,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import Image from "next/image";
import { getTokensMetadata } from "utils/getTokensMetadata";
import TransactionForm from "./TransactionForm";

export const BurnSPLView: FC = ({}) => {
  const { connection } = useConnection();

  const wallet = useWallet();
  const metaplex = new Metaplex(connection);
  const [userSPL, setUserSPL] = useState<any[]>([]);
  const [isFetched, setIsFetched] = useState<boolean>(false);
  const [isBurning, setIsBurning] = useState<boolean>(false);
  const [currentTx, setCurrentTx] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [toBurn, setToBurn] = useState<any>();

  async function getUserSPLToken() {
    if (!wallet.publicKey) {
      setUserSPL([]);
      return;
    }
    const publickey = wallet.publicKey;
    setIsFetched(false);

    const { value: splAccounts } =
      await connection.getParsedTokenAccountsByOwner(
        publickey,
        {
          programId: new PublicKey(
            "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
          ),
        },
        "processed"
      );
    const allUserTokens = splAccounts
      .filter((m) => {
        const amount = m.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
        return amount != 0;
      })
      .map((m) => {
        const tokenAccountaddress = m.pubkey.toBase58();
        const mintAdddress = m.account?.data?.parsed?.info?.mint;
        const amount = m.account?.data?.parsed?.info?.tokenAmount?.amount;
        return { tokenAccountaddress, mintAdddress, amount };
      });

    const userNFTs = (
      await metaplex.nfts().findAllByOwner({ owner: wallet.publicKey })
    ).map((nft) => {
      // @ts-ignore
      const mint = nft.mintAddress.toBase58();
      return mint;
    });

    const userSPL: any = [];
    allUserTokens.map((token) => {
      // @ts-ignore
      const mint = token.mintAdddress;
      if (!userNFTs.includes(mint)) {
        const tokenAccountaddress = token.tokenAccountaddress;
        const amount = token.amount;
        userSPL.push({
          tokenAccountaddress: tokenAccountaddress,
          mintAdddress: mint,
          amount: amount,
        });
      }
    });

    const userSPLMetadata = await getTokensMetadata(userSPL, connection);

    setUserSPL(userSPLMetadata);
    setIsFetched(true);
    console.log("user SPL tokens", userSPLMetadata);
  }

  useEffect(() => {
    getUserSPLToken();
  }, [wallet.publicKey]);

  const burnTokens = async (toBurn: any, amount: number) => {
    const publickey = wallet.publicKey;
    try {
      if (toBurn != undefined && publickey) {
        setIsBurning(true);
        setSuccess(false);
        setMessage("");
        let Tx = new Transaction();

        const account = new PublicKey(toBurn.tokenAccount);
        const mint = new PublicKey(toBurn.mint);

        const burnInstruction = createBurnInstruction(
          account,
          mint,
          publickey,
          amount ** 7,
          [],
          TOKEN_2022_PROGRAM_ID
        );
        Tx.add(burnInstruction);

        const signature = await wallet.sendTransaction(Tx, connection);
        const confirmed = await connection.confirmTransaction(
          signature,
          "processed"
        );
        console.log("confirmation", signature);
        setIsBurning(false);
        setSuccess(true);
        setCurrentTx(signature);
        await getUserSPLToken();
      } else {
        setMessage("Please choose at least one token to burn first!");
        setSuccess(false);
      }
    } catch (error) {
      await getUserSPLToken();
      setIsBurning(false);
      console.log(error);
    }
  };

  return (
    <main className="h-screen w-screen overflow-hidden relative bg-[#F2F6FF]">
      <div className="w-full px-10 flex flex-row items-center justify-between mt-3 ">
        <div className="rounded-full overflow-hidden">
          <Image
            alt="logo"
            src="https://bafybeidov7gddabmqke3fozpuvlllp3q2c537f2vfyyf6or4spbbao6cee.ipfs.nftstorage.link/"
            width={100}
            height={100}
          />
        </div>
        <WalletMultiButton />
      </div>

      <div className="flex items-center justify-center w-[100%] h-[80%]">
        <section className="isolate w-11/12 lg:w-1/4 rounded-lg flex flex-col items-center p-8 space-y-2 ring-1 ring-black/5 bg-white/20 shadow-2xl">
          <h1 className="text-xl font-bold mb-4 text-slate-600">
            Enter information
          </h1>
          <TransactionForm
            isFetched={isFetched}
            isBurning={isBurning}
            userSPL={userSPL}
            burnTokens={burnTokens}
            currentTx={currentTx}
          />
        </section>
      </div>
    </main>
  );
};

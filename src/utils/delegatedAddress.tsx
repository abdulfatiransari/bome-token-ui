import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import Link from "next/link";
import { FC, useEffect, useState } from "react";

type Props = {
  tokenMintAddress: string;
  publicKey: PublicKey | null;
  connection: Connection;
};

export const DelegatedAddress: FC<Props> = ({
  tokenMintAddress,
  publicKey,
  connection,
}) => {
  const [delegateAddress, setDelegateAddress] = useState("");

  useEffect(() => {
    async function getDelegatedAddress() {
      const mintPublickey = new PublicKey(tokenMintAddress);
      try {
        if (publicKey) {
          // get the associated token address
          const associatedAddress = await getAssociatedTokenAddress(
            mintPublickey,
            publicKey,
            false,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          );

          // get the token account info
          const tokenAccountInfo = await connection.getAccountInfo(
            associatedAddress
          );

          if (tokenAccountInfo) {
            const info = AccountLayout.decode(tokenAccountInfo.data);
            const delegate = new PublicKey(info.delegate).toBase58();
            setDelegateAddress(delegate);
          }
        }
      } catch (error) {
        const err = (error as any)?.message;
        console.log(err);
      }
    }
    getDelegatedAddress();
  }, []);

  return (
    <div>
      <Link
        target="_blank"
        className="flex font-bold underline"
        href={"https://solscan.io/token/" + delegateAddress}
      >
        Check delegate address
      </Link>
    </div>
  );
};

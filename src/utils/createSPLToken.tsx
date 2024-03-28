import { MetaplexFileTag } from "@metaplex-foundation/js";
import {
  CreateV1InstructionAccounts,
  DataV2,
} from "@metaplex-foundation/mpl-token-metadata";
import { none, publicKey } from "@metaplex-foundation/umi";
import { fromWeb3JsPublicKey } from "@metaplex-foundation/umi-web3js-adapters";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createInitializeMintInstruction,
  createInitializeTransferFeeConfigInstruction,
  createMintToInstruction,
  ExtensionType,
  getAssociatedTokenAddressSync,
  getMintLen,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { Dispatch, SetStateAction } from "react";
import { getMetaplexInstance } from "splHelper/helper";

const SPL_TOKEN_2022_PROGRAM_ID = publicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);
export async function createSPLToken(
  owner: PublicKey,
  wallet: WalletContextState,
  connection: Connection,
  quantity: number,
  decimals: number,
  isChecked: boolean,
  tokenName: string,
  symbol: string,
  metadataURL: string,
  description: string,
  file:
    | Readonly<{
        buffer: Buffer;
        fileName: string;
        displayName: string;
        uniqueName: string;
        contentType: string | null;
        extension: string | null;
        tags: MetaplexFileTag[];
      }>
    | undefined,
  metadataMethod: string,
  setIscreating: Dispatch<SetStateAction<boolean>>,
  setTokenAddresss: Dispatch<SetStateAction<string>>,
  setSignature: Dispatch<SetStateAction<string>>,
  setError: Dispatch<SetStateAction<string>>
) {
  try {
    setIscreating(true);
    setTokenAddresss("");
    const mint_account = Keypair.generate();

    // Set the decimals, fee basis points, and maximum fee
    const maxFee = BigInt(quantity * 10 ** decimals);
    // Define the amount to be minted and the amount to be transferred, accounting for decimals
    const mintAmount = quantity * 10 ** decimals;

    const metaplex = getMetaplexInstance("devnet", connection, wallet);

    // Define the extensions to be used by the mint
    const extensions = [ExtensionType.TransferFeeConfig];
    // Calculate the length of the mint
    const mintLen = getMintLen(extensions);
    // calculate rent for PDA
    const mintLamports = await connection.getMinimumBalanceForRentExemption(
      mintLen
    );

    const transferFeeConfigAuthority = wallet.publicKey;
    const withdrawFeeAuthority = wallet.publicKey;
    const mintAuthority = wallet.publicKey;
    const freezeAuthority = isChecked ? owner : null;

    let InitMint: TransactionInstruction;

    // const [metadataPDA] = await PublicKey.findProgramAddress(
    //   [
    //     Buffer.from("metadata"),
    //     PROGRAM_ID.toBuffer(),
    //     mint_account.publicKey.toBuffer(),
    //   ],
    //   PROGRAM_ID
    // );

    let URI: string = "";

    if (metadataMethod == "url") {
      if (metadataURL != "") {
        URI = metadataURL;
      } else {
        setIscreating(false);
        setError("Please provide a metadata URL!");
      }
    } else {
      if (file) {
        const ImageUri = await metaplex.storage().upload(file);

        if (ImageUri) {
          const { uri } = await metaplex.nfts().uploadMetadata({
            name: tokenName,
            symbol: symbol,
            description: description,
            image: ImageUri,
          });
          if (uri) {
            URI = uri;
          }
        }
      } else {
        setIscreating(false);
        setError("Please provide an image file!");
      }
    }

    if (URI != "") {
      const feeBasisPoints = 100;
      const tokenMetadata = {
        name: tokenName,
        symbol: symbol,
        uri: URI,
        sellerFeeBasisPoints: feeBasisPoints,
      };

      //   const onCLink

      const createMintAccountInstruction = await SystemProgram.createAccount({
        fromPubkey: owner,
        newAccountPubkey: mint_account.publicKey,
        space: mintLen,
        lamports: mintLamports,
        programId: TOKEN_2022_PROGRAM_ID,
      });
      const createInitializeTransferFeeInstruction =
        await createInitializeTransferFeeConfigInstruction(
          mint_account.publicKey,
          transferFeeConfigAuthority,
          withdrawFeeAuthority,
          100, // 100 = 1%
          maxFee,
          TOKEN_2022_PROGRAM_ID
        );
      InitMint = await createInitializeMintInstruction(
        mint_account.publicKey,
        decimals,
        mintAuthority as PublicKey,
        freezeAuthority,
        TOKEN_2022_PROGRAM_ID
      );

      const associatedTokenAccount = await getAssociatedTokenAddressSync(
        mint_account.publicKey,
        wallet.publicKey as PublicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const createATAInstruction =
        await createAssociatedTokenAccountIdempotentInstruction(
          wallet.publicKey as PublicKey,
          associatedTokenAccount,
          wallet.publicKey as PublicKey,
          mint_account.publicKey,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );

      const mintInstruction = await createMintToInstruction(
        mint_account.publicKey,
        associatedTokenAccount,
        mintAuthority as PublicKey,
        mintAmount,
        [],
        TOKEN_2022_PROGRAM_ID
      );
      //   const umi = createUmi(connection.rpcEndpoint);
      //   const userSigner = createSignerFromKeypair(
      //     umi,
      //     fromWeb3JsKeypair(userWallet)
      //   );

      //   const MetadataInstruction = createMetadataV2Builder({
      //     data: onChainData as any,
      //     ...accounts,
      //     //   metadata: metadataPDA,
      //     //   mint: mint_account.publicKey,
      //     mintAuthority: Signer,
      //     payer: userSigner as any,
      //     //   updateAuthority: owner,
      //   });

      const createAccountTransaction = new Transaction().add(
        createMintAccountInstruction,
        createInitializeTransferFeeInstruction,
        InitMint,
        createATAInstruction,
        mintInstruction
        // MetadataInstruction.toTransaction().instructions[0]
      );

      const createAccountSignature = await wallet.sendTransaction(
        createAccountTransaction,
        connection,
        { signers: [mint_account] }
      );

      const createAccountconfirmed = await connection.confirmTransaction(
        createAccountSignature,
        "confirmed"
      );

      const signature = createAccountSignature.toString();

      if (createAccountconfirmed) {
        setIscreating(false);
        setTokenAddresss(mint_account.publicKey.toBase58());
        setSignature(signature);
      }
    }
  } catch (error) {
    setIscreating(false);
    const err = (error as any)?.message;
    console.log(err);
    setError(err);
  }
}

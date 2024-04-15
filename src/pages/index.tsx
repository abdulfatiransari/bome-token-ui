
import React, { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction } from "@solana/web3.js";
import { useForm } from 'react-hook-form';
import { Button } from 'views/BurnSPLView/ui/button';
import { message } from "antd";
import { getTokensMetadata } from "utils/getTokensMetadata";

import {
    createBurnInstruction,
    TOKEN_2022_PROGRAM_ID,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import Image from "next/image";
import stepBurn from '../../public/assets/images/steps-burn.png';
import { Metaplex } from "@metaplex-foundation/js";
import { Box, Heading, Loader } from "lucide-react";
import Link from "next/link";
import Head from "next/head";

function burntoken() {
    const { connection } = useConnection();
    const wallet = useWallet();
    const metaplex = new Metaplex(connection);
    const [userSPL, setUserSPL] = useState<any | null>(null);
    const [isFetched, setIsFetched] = useState<boolean>(false);
    const [isBurning, setIsBurning] = useState<boolean>(false);
    const [signature, setSignature] = useState('')
    async function getUserSPLToken() {
        if (!wallet.publicKey) {
            setUserSPL([]);
            return;
        }
        const publickey = wallet.publicKey;
        setIsFetched(false);

        const { value: splAccounts2 } =
            await connection.getParsedTokenAccountsByOwner(
                publickey,
                {
                    programId: TOKEN_2022_PROGRAM_ID
                },
                "processed"
            );

        const { value: splAccounts3 } =
            await connection.getParsedTokenAccountsByOwner(
                publickey,
                {
                    programId: TOKEN_PROGRAM_ID
                },
                "processed"
            );


        let splAccounts = [...splAccounts2, ...splAccounts3]
        const allUserTokens = splAccounts
            .filter((m) => {
                const amount = m.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
                return amount != 0;
            })
            .map((m) => {
                console.log(m)
                const tokenAccountaddress = m.pubkey.toBase58();
                const mintAdddress = m.account?.data?.parsed?.info?.mint;
                const amount = m.account?.data?.parsed?.info?.tokenAmount?.amount;
                const decimal = m.account?.data?.parsed?.info?.tokenAmount?.decimals
                return { tokenAccountaddress, mintAdddress, amount, decimal, tokenProgram: m.account.owner };
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
                const decimal = token.decimal;
                userSPL.push({
                    tokenAccountaddress: tokenAccountaddress,
                    mintAdddress: mint,
                    amount: amount,
                    decimal: decimal,
                    tokenProgram: token.tokenProgram
                });
            }
        }
        );
        console.log(userSPL)

        const userSPLMetadata = await getTokensMetadata(userSPL, connection);
        setUserSPL(userSPLMetadata);
        setIsFetched(true);
        console.log("user SPL tokens", userSPLMetadata);
    }
    useEffect(() => {
        getUserSPLToken();
    }, [wallet.publicKey]);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        mode: "onBlur",
    });
    const onSubmit = async (values: any) => {
        BurnTokens(values)
    };

    const BurnTokens = async (values: any) => {
        const publickey = wallet.publicKey;
        try {
            setIsBurning(true);
            let Tx = new Transaction();
            const token = userSPL.find((a: any) => a.mint === values.tokenMint)
            console.log(userSPL)
            console.log(token)
            console.log(values)
            const account = new PublicKey(token.tokenAccount);
            const mint = new PublicKey(values.tokenMint);
            const amount = Number(values.amounts) * 10 ** Number(token.decimal);
            const burnInstruction = createBurnInstruction(
                account,
                mint,
                publickey as PublicKey,
                amount,
                [],
                token.tokenProgram
            );
            Tx.add(burnInstruction);

            const signature = await wallet.sendTransaction(Tx, connection);
            console.log(signature)
            setSignature(signature)
            // const confirmed = await connection.confirmTransaction(
            //     signature,
            //     "processed"
            // );
            console.log("confirmation", signature);
            reset();
            setIsBurning(false);
            message.success("Token Burn Sucessfully")
            // setIsBurning(false);
            setSignature(signature)
        } catch (error) {
            console.log(error)
            setIsBurning(false);
        }
    };
    return (
        // bg-[#121212]
        <>
            <Head>
                <title>BOME FIRE</title>
                <meta name="description" content="Solana tools to help you in the solana ecosystem " />
            </Head>
            <div className=' bg-[#F2F6FF] h-screen '>
                <div className="py-2 flex justify-end items-center container">
                    <div className="flex-none">
                        <WalletMultiButton className="btn btn-ghost" />
                    </div>
                </div>

                <div className='mx-auto container flex flex-col justify-around items-center h-[80%] relative'>
                    {signature && (
                        <div className="flex justify-between items-center w-full max-w-[300px] p-4 ring-1 ring-black/5 bg-white shadow-lg rounded-xl mx-auto   ">
                            <p className="text-sm text-[#67768c8c] font-semibold">
                                Transaction Success
                            </p>
                            <div className="flex  justify-start items-start">
                                <Link href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`} className="text-[#64748B] text-sm underline hover:text-[#67768c8c]" target="_blank">view on explorer</Link>
                                {/* <Link href={`https://explorer.solana.com/tx/${signature}`} className="text-[#64748B] text-sm underline hover:text-[#67768c8c]" target="_blank">view on explorer</Link> */}
                                <div onClick={() => setSignature("")} className="text-sm ml-2 text-[#64748B] cursor-pointer font-bold  hover:text-[#67768c8c]">X</div>
                            </div>
                        </div>
                    )}
                    <div>
                        <h1 className=' text-[35px] text-[#64748B] font-bold'>Burn Solana SPL or LP Tokens</h1>
                        <form
                            className="items-center flex flex-col w-full space-y-3 mt-5 mb-8 max-w-[400px] mx-auto  p-8 ring-1 ring-black/5 bg-white/20 shadow-2xl "
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            {/* <div className={`rounded-sm  placeholder:text-sm text-sm flex flex-row overflow-hidden w-full `}>
                        <input
                            {...register('tokenAccount')}
                            type="text"
                            placeholder="Token Account"
                            className='w-full h-fll border-none outline-none p-2'
                        />
                    </div>
                    <div className={`rounded-t-sm rounded-b-sm  placeholder:text-sm text-sm flex flex-row overflow-hidden w-full `}>
                        <input
                            type="text"
                            placeholder="Token Address"
                            {...register('tokenAddress')}
                            className='w-full h-fll border-none outline-none p-2'
                        />
                        <div className='bg-black p-2 h-full flex justify-center items-center' >
                            <BiReset className='text-white text-2xl cursor-pointer' onClick={handleResetTokenAddress} />
                        </div>
                    </div>
                    <div className={`rounded-t-sm rounded-b-sm placeholder:text-sm text-sm flex flex-row overflow-hidden w-full `}>
                        <input
                            type="text"
                            placeholder="Decimal"
                            className='w-full h-fll border-none outline-none p-2'
                            {...register('decimals')}
                        />
                        <div className='bg-black p-2  h-full flex justify-center items-center'>
                            <BiReset className='text-white text-2xl cursor-pointer' onClick={handleResetDecimal} />
                        </div>
                    </div> */}
                            {/* < BurnSPLView /> */}
                            <div className="mb-auto text-center  w-full">
                                {!wallet.publicKey && (

                                    <div className="text-center text-[20px] text-[#64748B]">
                                        Please, connect your wallet!
                                    </div>

                                )}
                                {/* {signature && (<div className="flex flex-col justify-center items-center w-full">
                            <p className="text-lg text-[#64748B] ">
                                Transaction Success
                            </p>
                            <Link href={`https://solscan.io/tx/${signature}?cluster=devnet`} style={{ border: "1px solid black", color: 'black', padding: '4px 16px', borderRadius: 16, marginRight: 50 }} target="_blank">View On Solscan</Link>
                            <Box onClick={() => setSignature('')} style={{ cursor: 'pointer', border: "1px solid white", color: 'white', padding: '8px 16px', borderRadius: 16, position: 'absolute', right: 0 }}>X</Box>
                        </div>)} */}

                                {!isFetched && wallet.publicKey && (
                                    <div className=" w-full flex justify-center ">
                                        <Loader color={"#64748B"} className="mx-2 circle  " />
                                        <div className="text-[#64748B] mx-2">Fetching Tokens....</div>
                                    </div>
                                )}
                                {isFetched && wallet.publicKey && (
                                    <div>
                                        {!userSPL.length ? (
                                            <div className="text-center text-[20px] text-red-500">
                                                No token found in this wallet!!
                                            </div>
                                        ) : (
                                            <div className="w-full justify-left flex  ">
                                                <div className="flex flex-col w-full">
                                                    {errors.tokenMint && (
                                                        <p className="text-red-500 text-left text-xs mb-1 ">
                                                            {errors.tokenMint.message?.toString()}
                                                        </p>)}
                                                    <select
                                                        {...register('tokenMint', { required: "Please select the Token" })}
                                                        className="bg-gray-50 outline-none border-gray-300 font-light text-sm rounded-sm block w-full px-1 py-2 dark:placeholder-gray-400 text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                    >
                                                        <option value="" disabled>Select a Token</option>
                                                        {userSPL?.map((token: any, index: number) => (
                                                            <option key={`token_${index}`} value={token.mint}>{token.name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="w-full  ">
                                {errors.amounts && (
                                    <p className="text-red-500  text-xs mb-1 ">
                                        {errors.amounts.message?.toString()}
                                    </p>)}
                                <div className={`rounded-t-sm rounded-b-sm placeholder:text-sm text-sm flex flex-row overflow-hidden w-full `}>
                                    <input
                                        {...register('amounts', { required: "please Enter the Amount " })}
                                        type="text"
                                        placeholder="Amounts to Burn"
                                        className='w-full h-fll border-none outline-none p-2 '
                                    />
                                    <div className='bg-[#64748B] text-white p-2 font-bold  h-full flex justify-center items-center'>
                                        MAX
                                    </div>
                                </div>
                            </div>
                            {!isBurning ? (
                                <div className="flex space-x-3 w-full justify-center items-center ">
                                    <Button
                                        type="submit"
                                        className=" py-2 px-5 bg-slate-500 rounded-md text-sm  hover:bg-slate-600 "
                                    >
                                        BURN TOKENS
                                    </ Button>
                                </div>
                            ) : (
                                <button className="btn  w-full flex justify-center items-center  text-[#64748B]">
                                    <svg
                                        role="status"
                                        className="inline mr-3 w-4 h-4 text-[#64748B] animate-spin"
                                        viewBox="0 0 100 101"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="#E5E7EB"
                                        />
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                    Burning...
                                </button>
                            )}


                        </form >
                        {/* <div className="container gradient-bg rounded-lg overflow-hidden mb-10">
                    <Image
                        src={stepBurn}
                        className=" rounded-lg w-full  h-full "
                        alt=""
                    />
                </div> */}
                    </div>

                </div >

            </div >
        </>

    )
}

export default burntoken
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Transaction } from "@solana/web3.js";
import { Loader } from "components";
import Link from "next/link";
import { useForm } from 'react-hook-form';
import { BiReset } from "react-icons/bi";
import { Button } from 'views/BurnSPLView/ui/button';

import {
    createBurnInstruction,
    TOKEN_2022_PROGRAM_ID
} from "@solana/spl-token";
import Image from "next/image";
import stepBurn from '../../public/assets/images/steps-burn.png';

const burnNft = () => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        mode: "onBlur",
    });
    const onSubmit = async (values: any) => {
        BurnTokens(values)
    };
    const { connection } = useConnection();
    const wallet = useWallet();

    const BurnTokens = async (values: any) => {
        const publickey = wallet.publicKey;
        console.log(publickey)
        try {
            let Tx = new Transaction();
            console.log(values)
            const account = new PublicKey(values.tokenAccount);
            const mint = new PublicKey(values.tokenAddress);
            const amount = Number(values.amounts) * 10 ** Number(values.decimals);
            const burnInstruction = createBurnInstruction(
                account,
                mint,
                publickey as PublicKey,
                amount,
                [],
                TOKEN_2022_PROGRAM_ID
            );
            Tx.add(burnInstruction);

            const signature = await wallet.sendTransaction(Tx, connection);
            console.log(signature)
            const confirmed = await connection.confirmTransaction(
                signature,
                "processed"
            );

            console.log("confirmation", signature);
        } catch (error) {
            console.log(error)
        }
    };


    return (
        <div className='bg-[#121212] min-h-[100vh] '>
            <div className="py-2 flex justify-end items-center container">
                <div className="flex-none">
                    <WalletMultiButton className="btn btn-ghost" />
                </div>
            </div>

            <div className='mx-auto container  flex flex-col justify-center items-center '>
                <h1 className='gradient-text my-5 text-[35px]'>Burn Solana SPL or LP Tokens</h1>
                <form
                    className="items-center flex flex-col w-full space-y-3 mb-10 max-w-[300px]  "
                    onSubmit={handleSubmit(onSubmit)}
                >
                    <div className={`rounded-sm  placeholder:text-sm text-sm flex flex-row overflow-hidden w-full `}>
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
                            <BiReset className='text-white text-2xl cursor-pointer' />
                        </div>
                    </div>
                    <div className={`rounded-t-sm rounded-b-sm  placeholder:text-sm text-sm flex flex-row overflow-hidden w-full `}>
                        <input
                            type="text"
                            placeholder="Decimal"
                            className='w-full h-fll border-none outline-none p-2'
                            {...register('decimals')}
                        />
                        <div className='bg-black p-2  h-full flex justify-center items-center'>
                            <BiReset className='text-white text-2xl cursor-pointer' />
                        </div>
                    </div>
                    <div className={`rounded-t-sm rounded-b-sm  placeholder:text-sm text-sm flex flex-row overflow-hidden w-full `}>
                        <input
                            {...register('amounts')}
                            type="text"
                            placeholder="Account to Burn"
                            className='w-full h-fll border-none outline-none p-2 '
                        />
                        <div className='bg-black text-white p-2 font-bold  h-full flex justify-center items-center'>
                            MAX
                        </div>
                    </div>

                    <div className="flex space-x-3 w-full justify-center items-center">
                        <Button
                            type="submit"
                            className="gradient-bg py-2 px-5 bg-slate-500 rounded-md text-sm  hover:bg-slate-600 "
                        >
                            BURN TOKENS
                        </ Button>
                    </div>

                </form >
                <div className="container gradient-bg rounded-lg overflow-hidden">
                    <Image
                        src={stepBurn}
                        className=" rounded-lg w-full  h-full "
                        alt=""
                    />
                </div>
            </div>

        </div>
    )
}

export default burnNft
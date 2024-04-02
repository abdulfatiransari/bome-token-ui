"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { saveAs } from 'file-saver';
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { parse } from "json2csv";
import { Loader2 } from "lucide-react";
import { FieldValues, useForm } from "react-hook-form";
import { db } from "../../configs/firebase";
import { Button } from "./ui/button";
import { ToastAction } from "./ui/toast";
import { useToast } from "./ui/use-toast";
import { useEffect, useState } from "react";

const TransactionForm = ({
  userSPL,
  isBurning,
  currentTx,
  burnTokens,
}: {
  userSPL: any[];
  isFetched?: boolean;
  isBurning?: boolean;
  currentTx: string;
  burnTokens: (toBurn: any, amount: number) => Promise<boolean>;
}) => {
  console.log("🚀 ~ TransactionForm ~ userSPL:", userSPL);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
  });
  const [totalBurnt, setTotalBurnt] = useState(0);
  const wallet = useWallet();
  const { toast } = useToast();
  const downloadDataAsCSV = async () => {
    const querySnapshot = await getDocs(collection(db, "transactions"));
    const data = querySnapshot.docs.map((doc) => doc.data());
    const csv = parse(data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    console.log(blob);
    saveAs(blob, "transactions.csv");
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDoc(doc(db, "totalTransaction", wallet.publicKey?.toBase58() || ""));
        const data = querySnapshot.data();
        console.log(data)
        setTotalBurnt(data?.amountBurnt || 0);
        // console.log(data.am)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData()
  }, [wallet])

  const onSubmit = async (data: FieldValues) => {
    // const bomePriceUsd = await fetch(
    //   "https://api.coingecko.com/api/v3/simple/price?ids=book-of-meme&vs_currencies=usd"
    // )
    //   .then((r) => r.json())
    //   .then((a) => a?.["book-of-meme"]?.usd || 0);
    // const tokensToBurn = Math.floor(69 / bomePriceUsd);
    if (!wallet.publicKey) return;
    const tokenToBurn = userSPL.find(
      (token) => token.mint === "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82"
    );

    if (!tokenToBurn)
      return toast({
        action: <ToastAction altText="Try again">Try again</ToastAction>,
        variant: "destructive",
        title: "Failed to burn tokens",
        description: "The tokens specified were not found in your wallet",
      });
    const success = await burnTokens(tokenToBurn, 69);
    if (!success) return;
    await setDoc(doc(db, "totalTransaction", wallet.publicKey.toBase58()), {
      amountBurnt: totalBurnt + 69,
    })
      .then(async () =>
        await addDoc(collection(db, "transactions"), {
          walletAddress: wallet.publicKey?.toBase58(),
          ethwalletAddress: data.walletAddress,
          transactionHash: currentTx,
          createdAt: new Date()
        }).then(() => toast({
          title: "Transaction added successfully",
          description: "The transaction has been added successfully",
        }))
      )
      .catch((err) =>
        toast({
          action: <ToastAction altText="Try again ">Try again</ToastAction>,
          variant: "destructive",
          title: "Failed to add transaction",
          description: "The transaction could not be added",
        })
      );
  };
  const generate = (totalBurnt: number) => totalBurnt >= 888;
  // console.log(generate(totalBurnt))

  return (
    <>
      <form
        className="items-center flex flex-col w-full space-y-3 [&_*]:w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          {...register("walletAddress", {
            required: "Please enter ETH address",
          })}
          type="text"
          placeholder="ETH Wallet address"
          className={`border ${errors.walletAddress ? "border-red-500" : "border-gray-400"
            } rounded-lg p-2 placeholder:text-sm text-sm`}
        />
        {errors.walletAddress && (
          <p className="text-red-500 text-xs">
            {errors.walletAddress.message?.toString()}
          </p>
        )}

        <div className="flex space-x-3 w-full">
          <Button
            disabled={isSubmitting || isBurning || (generate(totalBurnt))}
            type="submit"
            className="p-2 bg-slate-500 rounded-md text-sm hover:bg-slate-600 text-white"
          >
            {(isSubmitting || isBurning) && (
              <Loader2 className="animate-spin w-5 h-5 overflow-hidden" />
            )}
            {isSubmitting || isBurning ? "" : "Burn 69 $BOME"}
          </Button>
        </div>
      </form >
      <Button
        onClick={downloadDataAsCSV}
        className="p-2 bg-slate-500 w-full rounded-md text-sm hover:bg-slate-600 text-white"
      >
        Download Data as CSV
      </Button>

    </>
  );
};

export default TransactionForm;

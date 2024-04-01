"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import { saveAs } from "file-saver";
import { addDoc, collection, doc, getDocs, setDoc } from "firebase/firestore";
import { parse } from "json2csv";
import { Loader2 } from "lucide-react";
import { FieldValues, useForm } from "react-hook-form";
import { db } from "../../configs/firebase";
import { Button } from "./ui/button";
import { ToastAction } from "./ui/toast";
import { useToast } from "./ui/use-toast";

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
  burnTokens: (toBurn: any, amount: number) => void;
}) => {
  console.log("🚀 ~ TransactionForm ~ userSPL:", userSPL);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onBlur",
  });
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

  const onSubmit = async (data: FieldValues) => {
    console.log(data);
    if (!wallet.publicKey) return;
    await burnTokens(
      userSPL.find((token) => token.mint === data.tokenAddress),
      data.amountBurnt
    );
    await addDoc(collection(db, "transactions"), {
      walletAddress: data.walletAddress,
      transactionHash: currentTx,
      amountBurnt: data.amountBurnt,
      tokenAddress: data.tokenAddress,
    })
      .then((res) =>
        toast({
          title: "Transaction added successfully",
          description: "The transaction has been added successfully",
        })
      )
      .catch((err) =>
        toast({
          action: <ToastAction altText="Try again">Try again</ToastAction>,
          variant: "destructive",
          title: "Failed to add transaction",
          description: "The transaction could not be added",
        })
      );
  };
  return (
    <>
      <form
        className="items-center flex flex-col w-full space-y-3 [&_*]:w-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <input
          {...register("walletAddress")}
          value={wallet.publicKey?.toBase58()}
          type="text"
          placeholder="Wallet address"
          className={`border ${
            errors.walletAddress ? "border-red-500" : "border-gray-400"
          } rounded-lg p-2 placeholder:text-sm text-sm`}
        />
        {errors.walletAddress && (
          <p className="text-red-500 text-xs">
            {errors.walletAddress.message?.toString()}
          </p>
        )}
        <input
          {...register("amountBurnt", { required: "Amount burnt is required" })}
          type="text"
          placeholder="Amount burnt"
          className={`border ${
            errors.amountBurnt ? "border-red-500" : "border-gray-400"
          } rounded-lg p-2 placeholder:text-sm text-sm`}
        />
        {errors.amountBurnt && (
          <p className="text-red-500 text-xs">
            {errors.amountBurnt.message?.toString()}
          </p>
        )}

        <select
          {...register("tokenAddress", {
            required: "Token address is required",
          })}
          className={`border ${
            errors.tokenAddress ? "border-red-500" : "border-gray-400"
          } rounded-lg p-2 placeholder:text-sm text-sm`}
        >
          <option value="">Select Token</option>
          {userSPL.map((item: any) => (
            <option key={item.mint} value={item.mint}>
              {item.name || item.mint}
            </option>
          ))}
        </select>
        {errors.tokenAddress && (
          <p className="text-red-500 text-xs">
            {errors.tokenAddress.message?.toString()}
          </p>
        )}
        <div className="flex space-x-3 w-full">
          <Button
            type="reset"
            className="p-2 bg-slate-500 rounded-md text-sm hover:bg-slate-600 text-white font-semibold"
          >
            Reset
          </Button>
          <Button
            disabled={isSubmitting || isBurning}
            type="submit"
            className="p-2 bg-slate-500 rounded-md text-sm hover:bg-slate-600 text-white"
          >
            {(isSubmitting || isBurning) && (
              <Loader2 className="animate-spin w-5 h-5 overflow-hidden" />
            )}
            {isSubmitting || isBurning ? "" : "Confirm"}
          </Button>
        </div>
      </form>
      <Button
        onClick={downloadDataAsCSV}
        className="w-full text-sm bg-slate-600 rounded-md p-2 text-white hover:bg-slate-700"
      >
        Download data as CSV
      </Button>
    </>
  );
};

export default TransactionForm;

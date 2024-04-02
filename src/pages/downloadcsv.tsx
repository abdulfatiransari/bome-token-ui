import React from 'react'
import { saveAs } from 'file-saver';
import { collection, getDocs } from "firebase/firestore";

import { parse } from "json2csv";
import { db } from 'configs/firebase';
import { Button } from 'views/BurnSPLView/ui/button';

const downloadcsv = () => {
    const downloadDataAsCSV = async () => {
        const querySnapshot = await getDocs(collection(db, "transactions"));
        const data = querySnapshot.docs.map((doc) => doc.data());
        const csv = parse(data);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        saveAs(blob, "transactions.csv");
    };
    return (
        <div className='h-screen w-screen overflow-hidden relative flex justify-center items-center bg-[#F2F6FF]'>

            <Button
                onClick={downloadDataAsCSV}
                className="p-2 bg-slate-500  rounded-md text-sm hover:bg-slate-600 text-white"
            >
                Download Data as CSV
            </Button>
        </div>
    )
}
export default downloadcsv;
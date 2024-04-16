import React, { useState, useEffect } from 'react'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '../../configs/firebase'
const TABLE_HEAD = ["No", "Burn Amount", "Wallet Address", "Tx Hash"];
const Leaderboards = () => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const getData = async () => {
        setLoading(true)
        const docsSnap = await getDocs(collection(db, 'transactions'))
        const docs = docsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }))
        console.log(docs)
        setData(docs)
        setLoading(false)
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <div className="mx-auto flex py-16 flex-col items-center justify-center gap-y-16 bg-[#F2F6FF]">
            <div className="relative mx-auto w-full max-w-[40vw] max-lg:max-w-full">
                <h1 className="text-4xl font-bold text-center uppercase">Leaderboards</h1>
                <button onClick={getData} className="px-4 py-2 rounded-lg border border-white absolute top-0 right-10 hover:border-blue-500 hover:text-blue-500 text-white bg-blue-500 hover:bg-transparent transition-all duration-300 ease-in-out">{loading ? "Loading..." : "Refresh"}</button>
            </div>
            <div className="h-full w-full max-w-[80vw] max-lg:overflow-scroll">
                <table className="mx-auto w-full min-w-max table-auto text-left">
                    <thead>
                        <tr>
                            {TABLE_HEAD.map((head) => (
                                <th
                                    key={head}
                                    className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                                >
                                    <span
                                        className="font-normal leading-none opacity-70"
                                    >
                                        {head}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.sort(function (a, b) {
                            return Number(b.amountBurnt) - Number(a.amountBurnt)
                        }).slice(0, 100).map(({ walletAddress, transactionHash, amountBurnt }, index) => {
                            const isLast = index === data.length - 1;
                            const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

                            return (
                                <tr key={transactionHash}>
                                    <td className={classes}>
                                        <span
                                            className="font-normal"
                                        >
                                            {index + 1}
                                        </span>
                                    </td>
                                    <td className={classes}>
                                        <span
                                            className="font-normal"
                                        >
                                            {amountBurnt}
                                        </span>
                                    </td>
                                    <td className={classes}>
                                        <a
                                            href={'https://solscan.io/account/' + walletAddress}
                                            target="_blank"
                                            className="font-normal"
                                        >
                                            {walletAddress.slice(0, 8)}...{walletAddress.slice(walletAddress.length - 8)}
                                        </a>
                                    </td>
                                    <td className={classes}>
                                        <a
                                            href={'https://solscan.io/tx/' + transactionHash}
                                            target="_blank"
                                            className="font-medium"
                                        >
                                            {transactionHash.slice(0, 8)}...{transactionHash.slice(transactionHash.length - 8)}
                                        </a>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Leaderboards
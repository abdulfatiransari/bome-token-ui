import type { NextPage } from "next";
import Head from "next/head";
import { BurnSPLView } from "../views";
// import Footer from "components/Footer";

const Home: NextPage = (props) => {
  return (
    <div className=" flex flex-col h-screen justify-between">
      <Head>
        <title>BOME FIRE</title>
        <meta name="description" content="Solana tools to help you in the solana ecosystem" />
      </Head>
      <BurnSPLView />
      {/* <Footer/> */}
    </div>
  );
};

export default Home;
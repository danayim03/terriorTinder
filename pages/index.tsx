import Head from "next/head";
import Image from "next/image";

import s from "./index.module.scss"
import { useRouter } from "next/router";
import { useAuth } from "@/context/authcontext";

export default function Home() {

  const router = useRouter();
	const { user, status, googlesignin, logout } = useAuth();


  return (
    <>
      <Head>
        <title>Terrier Tinder</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={s.main}>
        <h1 className={s.action} onClick={() => { console.log(user) }}>Terrier Tinder</h1>
        <div className={s.tagline}>Find your True Rhett at BU 💘</div>

        {
          user ?
            <div className={s.welcomeback}>
              welcome back {user.displayName?.split(" ")[0]} {"💘"}
            </div>
            :
            <button className={s.googlesignin}
              onClick={
                () => {
                  console.log("signing in with google");
                  googlesignin();
                }
              }
            >
              <img src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png" />
              Sign In with Google
            </button>
        }
        {status == "nonbu" ? <div className={s.nonbu}>That's not a bu email...</div> : null}
        {/* <Background /> */}
      </main>
    </>
  );
}

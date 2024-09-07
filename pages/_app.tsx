import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import Script from "next/script";

import AuthProvider from "@/context/authcontext";
import { useRouter } from "next/router";
import RedirectBasedOnAuth from "@/redirect/Redirect";

export default function App({ Component, pageProps }: AppProps) {
	const router = useRouter();
	return (
		<AuthProvider>
			<RedirectBasedOnAuth>
				<Head>
					{/* <script src={'https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js'} />
					<script src={'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js'} /> */}
					<link rel="preconnect" href="https://fonts.googleapis.com" />
					<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/>
					<link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
					<link rel="icon" href="/terrierv.png" />
					<title>Terrier Tinder</title>
				</Head>
				<Component {...pageProps} />
			</RedirectBasedOnAuth>
		</AuthProvider>
	)
}

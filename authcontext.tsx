import { useContext, createContext, useState, useEffect } from "react";
import {
	signInWithPopup,
	signOut,
	onAuthStateChanged,
	GoogleAuthProvider,
} from "firebase/auth";

import { db } from "@/firebase/config";
import { collection, doc, getDoc, getDocs, setDoc, query, where } from "firebase/firestore";

import { User } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useRouter } from "next/router";

import s from "./authcontext.module.scss";

interface Terrier {
	onboarded: boolean;
	user: User | null;
}

interface IAuthContext {
	status: "nonbu" | "bu" | null;
	terrier: Terrier | null;
	user: User | null;
	loading: boolean;
	askToRefresh: () => void;
	googlesignin: () => void;
	logout: () => void;
}

const AuthContext = createContext<IAuthContext>({
	status: null,
	user: null,
	terrier: null,
	loading: false,
	askToRefresh: () => { },
	googlesignin: () => { },
	logout: () => { },
});

export function useAuth() {
	return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    console.log("auth provider");
	let router = useRouter();

	const [terrier, setTerrier] = useState<Terrier | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [status, setStatus] = useState<"nonbu" | "bu" | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [askedToRefresh, setAskedToRefresh] = useState<boolean>(false);

	function askToRefresh() { setAskedToRefresh(!askedToRefresh); }

	function googlesignin() {
        console.log("signing in with google!");
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider).then((result) => {
			if (result && result?.user?.email?.split("@")[1] !== "bu.edu") {
				setStatus("nonbu");
				setTimeout(() => { setStatus(null); }, 4000);
			} else {
				console.log("pushing", auth); router.push("/matchmaking");
			}
		}).catch((error) => {
			console.log(error);
		});
	};
	function logout() { signOut(auth); router.push("/"); setTerrier(null); };

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
			if (currentUser?.email?.split("@")[1] == "bu.edu" || currentUser == null) {
				setUser(currentUser);

				if (currentUser == null) { 
					setTerrier(null);
				} else {
					// check if user is onboarded by getting user from firestore and checking onboarded field
					const userRef = doc(db, "users", currentUser?.email || "");
					const docSnap = await getDoc(userRef)
					const data = docSnap.data();
					const onboarded: boolean | undefined = data?.onboarded;
					setTerrier({ onboarded: onboarded || false, user: currentUser });

				}
			} else {
				router.push("/"); 
			}
			setLoading(false);
		});
		return () => unsubscribe();
	}, [user, askedToRefresh]);

	return (
		<AuthContext.Provider value={{ user, terrier, status, loading, googlesignin, logout, askToRefresh }}>
			
			{loading ? <div className={s.load}>loading...</div> : children}
		</AuthContext.Provider>
	);
};
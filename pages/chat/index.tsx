import React, { useEffect, useState } from "react";
import s from './chat.module.scss';
import { useAuth } from "@/context/authcontext";
import Button from "@/components/button/button";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/config";
import Link from "next/link";
import { BsEmojiHeartEyesFill, BsChatRightHeartFill, BsPersonCircle } from "react-icons/bs";
import { useRouter } from "next/router";

export default function Profile() {

	const { user, logout } = useAuth();
	let router = useRouter();
	const currentpath = router.pathname;

	const [matches, setMatches] = useState<string[]>([]);

	async function getmatches() {
		// get the current user's data, especially the matches and rejected arrays
		const userDoc = doc(db, "users", user!.email!);
		const userSnap = await getDoc(userDoc);
		const currentUser = userSnap.data();

		if (!currentUser) {
			console.log("No user data found");
			return;
		}

		// get the current user's matches
		const matches = currentUser.matched;
		console.log(matches);
		setMatches(matches);
	}

	useEffect(() => {
		async function init() {
			await getmatches();
		}
		init();
	}, []);

	return (
		<main className={s.chat}>
			<section>
				<div className={s.content}>
					<h1>Your Matches</h1>
					{matches.length === 0 ? <p>No matches found</p> : null}
					{
						matches.map((match, index) => {
							return (
								<div key={index} className={s.match}>
									<p>{match}</p>
								</div>
							);
						})
					}
				</div>
			</section>
			<section className={s.spacer}></section>
			<section className={s.navigation}>
				<Link href="/matchmaking"
					className={currentpath === "/matchmaking" ? s.active : ""}
				>
					<BsEmojiHeartEyesFill />
				</Link>
				<Link href="/chat" className={currentpath === "/chat" ? s.active : ""}>
					<BsChatRightHeartFill />
				</Link>
				<Link href="/profile" className={currentpath === "/profile" ? s.active : ""}>
					<BsPersonCircle />
				</Link>
			</section>
		</main>
	);
}
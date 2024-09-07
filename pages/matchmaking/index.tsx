import { useAuth } from '@/context/authcontext';
import Link from 'next/link';
import { BsChatRightHeartFill, BsEmojiHeartEyesFill, BsPersonCircle } from "react-icons/bs";
import s from './matchmaking.module.scss';
import { useRouter } from 'next/router';
import { ImCross } from "react-icons/im";
import { db } from '@/firebase/config';
import { arrayUnion, collection, doc, getDoc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function Matchmaking() {
    const router = useRouter();
    const { user, logout } = useAuth();

    let currentpath = router.pathname;

    const [loading, setLoading] = useState<boolean>(false);

    const [users, setUsers] = useState<any[]>([]);
    const [currentmatch, setCurrentMatch] = useState<any>(null);

    const [excluded, setExcluded] = useState<string[]>([]);
    async function exclude() {
        console.log("Excluding users");
        // get the current user's data, especially the matches and rejected arrays
        const userDoc = doc(db, "users", user!.email!);
        const userSnap = await getDoc(userDoc);
        const currentUser = userSnap.data();

        console.log(currentUser);

        if (!currentUser) {
            console.log("No user data found");
            return;
        }

        const preferredGender = currentUser.preferences.p_gender;
        const preggeredAges = currentUser.preferences.p_age;

        // set the excluded array to the current user's matches and rejected arrays
        const toexclude = [...(currentUser.matched || []), ...(currentUser.rejected || []), ...(currentUser.liked || []), user!.email!];
        setExcluded(toexclude);
        console.log([...(currentUser.matched || []), ...(currentUser.rejected || []), ...(currentUser.liked || []), user!.email!]);
    
        console.log("pooling")
        await pool(toexclude);
    }

    async function pool(excluded: any) {
        // get all the users from the users collection where the user's id is not the same as the current user's id
        // and where the user's id is not in the current user's matches array
        // and where the user's id is not in the current user's rejected array

        if (excluded.length === 0) {
            return;
        }

        console.log(excluded);

        const userCollectionRef = collection(db, 'users');
        const q = query(userCollectionRef, where('email', 'not-in', excluded), limit(10));
        const userSnap = await getDocs(q);
        const users = userSnap.docs.map(doc => doc.data());
        console.log(users);
        setUsers(users);
    }

    useEffect(() => {
        exclude();
    }, []);

    async function like(index: number) {
        if (users.length === 0 || index >= users.length) return;

        const likedUser = users[index];
        const userDoc = doc(db, "users", user!.email!); // Document reference for the current user
        const likedUserDoc = doc(db, "users", likedUser.email); // Document reference for the liked user

        // Update the current user's liked array
        await updateDoc(userDoc, {
            liked: arrayUnion(likedUser.email)
        });

        const likedUserData = await getDoc(likedUserDoc);
        console.log(likedUserData.data());
        if (likedUserData.exists() && likedUserData.data().liked?.includes(user!.email)) {
            // It's a match! Both users have liked each other
            console.log(`It's a match with ${likedUser.info.firstname}!`);
            // Here you might handle the match event (e.g., send notifications, update match status, etc.)


            // Update the current user's matches array
            await updateDoc(userDoc, {
                matched: arrayUnion(likedUser.email)
            });

            // Update the liked user's matches array
            await updateDoc(likedUserDoc, {
                matched: arrayUnion(user!.email)
            });
            
            setCurrentMatch(likedUser);
        }


        // After processing, you might want to update the UI or exclude the liked user from future queries
        setUsers(currentUsers => currentUsers.filter((_, i) => i !== index)); // Remove the liked user from the current users array
    }

    async function rejects(index: number) {
        if (users.length === 0 || index >= users.length) return;

        const rejectedUser = users[index];
        const userDoc = doc(db, "users", user!.email!); // Document reference for the current user

        // Update the current user's rejected array
        await updateDoc(userDoc, {
            rejected: arrayUnion(rejectedUser.email)
        });

        // After processing, you might want to update the UI or exclude the rejected user from future queries
        setUsers(currentUsers => currentUsers.filter((_, i) => i !== index)); // Remove the rejected user from the current users array
    }
    


    if (!user) {
        return (
            <></>
        )
    }

    return (
        <main className={s.matchmaking}>
            <h1 className={s.tagline}>Find your True Rhett 😍</h1>
            <section className={s.matchspace}>
                {!currentmatch && users.length !== 0 && <div className={s.reject} 
                    onClick={async () => { await rejects(0); }}
                >
                    ❎
                </div>}
                {
                    currentmatch ? <div className={s.match}>
                        <div className={s.name}>
                            {currentmatch.info.firstname}, {currentmatch.info.age}
                        </div>
                        <div className={s.exit}
                            onClick={() => {
                                setCurrentMatch(null);
                            }}
                        >
                            <ImCross />
                        </div>
                        <div className={s.confetti}>
                            It's a match 🎉
                        </div>
                        <img src={currentmatch.photos[0]} />
                    </div> : <></>
                }
                {
                    !currentmatch && users ? users.slice(0, 1).map(user => {
                        console.log(user);
                        return <div className={s.person}>
                            <div className={s.name}>
                                {user.info.firstname}, {user.info.age}
                            </div>
                            <img src={user.photos[0]} />
                            <div className={s.arrows}>
                                
                            </div>
                            <div className={s.bio}>
                                <span>{user.details.college}</span>
                                <span>{user.details.residence}</span>
                                <span>{user.details.year}</span>
                            </div>
                        </div>
                    }) : <></>
                }
                {
                    (!currentmatch && users.length === 0) ? <div className={s.empty}>
                        <h1>No more users to show</h1>
                    </div> : <></>      
                }
                {!currentmatch && users.length !== 0 && <div className={s.like} onClick={async () => { await like(0); }} >
                    ❤️
                </div>}
            </section>
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
        
    )
}
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/authcontext";
import { get } from "http";

// these are the protected routes that you need token verification
// add routes that you want to have it protected
// also only these routes can get the decoded jwt token data
// Many of these routes do not exits yet. That's okay (:
const protectedRoutes = [
    "/matchmaking",
    "/profile",
    "/onboarding",
];

const RedirectBasedOnAuth = ({ children }: { children: React.ReactNode }) => {
    /**
     * This is a higher level component who's job it is to redirect the user to the home page if they are not authenticated but attempt to navigate to a protected route.
     */
    const [calledPush, setCalledPush] = useState(false);
    const { user, logout, googlesignin, terrier, loading } = useAuth();
    const router = useRouter();
    const currentRoute = router.asPath; // this shows the route you are currently in

    useEffect(() => {

        if (loading) {
            return;
        } else {
            console.log(terrier); 
        }

        if (protectedRoutes.includes(currentRoute)) {
            if ((!user && !calledPush)) {
                setCalledPush(true);
                router.push("/");
                return;
            }

            if (terrier && !terrier.onboarded && currentRoute !== "/onboarding") {
                console.log("pushing to onboarding");
                setCalledPush(true);
                router.push("/onboarding");
                return;
            } else if (terrier && terrier.onboarded && currentRoute === "/onboarding") {
                console.log("pushing to matchmaking");
                setCalledPush(true);
                router.push("/matchmaking");
                return;
            }

        } else if (currentRoute === "/") {
            console.log("current route is /");
            if (user) {
                console.log(terrier);
                if (terrier && !terrier.onboarded) {
                    console.log("pushing to onboarding");
                    setCalledPush(true);
                    router.push("/onboarding");
                    return;
                } else {
                    console.log("pushing to matchmaking");
                    setCalledPush(true);
                    router.push("/matchmaking");
                }


                return;
            } else {
                console.log("no user");
            }
        }

    }, [calledPush, currentRoute, router, terrier]);

    return children;
};

export default RedirectBasedOnAuth;
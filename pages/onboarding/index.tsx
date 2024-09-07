import React, { useState } from "react";
import { useAuth } from "@/context/authcontext";
import { OnboardingFormData } from "@/validation/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { onboardingSchema } from "@/validation/schema";
import Input from "@/components/input/input";
import s from './onboarding.module.scss';
import Button from "@/components/button/button";

import { db } from "@/firebase/config";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import InfoForm from "@/forms/info/info";
import DetailsForm from "@/forms/details/details";
import PreferencesForm from "@/forms/preferences/preferences";
import { useRouter } from "next/router";
import PhotosForm from "@/forms/photos/photos";

export default function Onboarding() {
    const router = useRouter();
    const { user, logout, askToRefresh } = useAuth();

    const [stage, setStage] = useState<"info" | "preferences" | "interests" | "photos" | "complete">("info");
    async function onboard() {
        const userDoc = doc(db, "users", user!.email!);
        await setDoc(userDoc, { onboarded: true }, { merge: true });
        askToRefresh();
    }


    if (!user) return <div>loading...</div>;
    
    return (
        <section className={s.onboarding}>
            <div className={s.hey}>Hey Terrier, looking good 😉</div>
            <div className={s.info}>

                {stage === "info" && <div className={s.progress}>we need some information about you to get started!</div>}
                {stage === "preferences" && <div className={s.progress}>let's get to know your preferences</div>}
                {stage === "interests" && <div className={s.progress}>lets get to know you as a terrier</div>}
                {stage === "photos" && <div className={s.progress}>show that face card to the world</div>}
                {stage === "complete" && 
                    <div className={s.progress}>
                        <div>you're all set to meet your perfect Rhett! 🎉</div>
                        <Button text="continue" onClick={onboard} />
                    </div>
                }
            </div>


            {stage === "info" && <InfoForm callback={() => setStage("preferences")}/>}

            {stage === "preferences" && <PreferencesForm callback={() => setStage("interests")}/>}
            
            {stage === "interests" && <DetailsForm callback={() => setStage("photos")}/>}

            {stage === "photos" && <PhotosForm callback={() => setStage("complete")}/>}
        </section>
    );
}
import Button from "@/components/button/button";
import Check from "@/components/check/check";
import Input from "@/components/input/input";
import Select from "@/components/select/select";
import Slider from "@/components/slider/slider";
import { useAuth } from "@/context/authcontext";
import { db } from "@/firebase/config";
import { PreferencesFormData } from "@/validation/form";
import { PGenders } from "@/validation/models";
import { preferencesSchema } from "@/validation/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { doc, setDoc } from "firebase/firestore";
import { register } from "module";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
    callback?: () => void;
}

export default function PreferencesForm({ callback }: Props) {

    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);

    async function onSubmit(data: PreferencesFormData) {
        setLoading(true);
        console.log(data);

        let age_range = Array.from({ length: data.p_age[1] - data.p_age[0] + 1 }, (_, i) => i + data.p_age[0]);

        const payload = {
            preferences: {
                p_ages: age_range,
                p_gender: data.p_gender
            }
        }
        // get the user document, then the info col
        const userDoc = doc(db, "users", user!.email!);
        await setDoc(userDoc, payload, { merge: true });
        setLoading(false);
        callback && callback();
    }

    const { register, handleSubmit, control, formState: { errors } } =
        useForm<PreferencesFormData>({
            resolver: zodResolver(preferencesSchema),
            defaultValues: {
                p_age: [18, 24]
            }
        });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
                <Select<PreferencesFormData>
                    type="text"
                    inputstyle="input"
                    label="who are you interested in?"
                    placeholder="who you're interested in"
                    name="p_gender"
                    register={register}
                    error={errors.p_gender as any}
                    options={Object.values(PGenders)}
                />
                <Slider<PreferencesFormData>
                    type="number"
                    label="age range"
                    name="p_age"
                    register={register}
                    control={control}
                    error={errors.p_age  as any}
                />
                <Button text="Submit" type="submit"
                    loading={loading}
                />
            </form>
    )
}
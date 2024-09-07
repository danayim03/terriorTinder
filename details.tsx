import Button from "@/components/button/button";
import Check from "@/components/check/check";
import Input from "@/components/input/input";
import Select from "@/components/select/select";
import { useAuth } from "@/context/authcontext";
import { db } from "@/firebase/config";
import { DetailsFormData } from "@/validation/form";
import { Colleges, Residences, Years  } from "@/validation/models";
import { detailsSchema } from "@/validation/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { doc, setDoc } from "firebase/firestore";
import { register } from "module";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
    callback?: () => void;
}

export default function DetailsForm({ callback }: Props) {

    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);

    async function onSubmit(data: DetailsFormData) {
        setLoading(true);
        console.log(data);

        const payload = {
            details: {
                ...data
            }
        }
        // get the user document, then the info col
        const userDoc = doc(db, "users", user!.email!);
        await setDoc(userDoc, payload, { merge: true });
        setLoading(false);
        callback && callback();
    }

    const { register, handleSubmit, control, formState: { errors } } =
        useForm<DetailsFormData>({
            resolver: zodResolver(detailsSchema),
            defaultValues: {}
        });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
                <Select<DetailsFormData>
                    type="text"
                    inputstyle="input"
                    label="your year"
                    placeholder="your year"
                    name="year"
                    register={register}
                    error={errors.year as any}
                    options={Object.values(Years)}
                />
                <Select<DetailsFormData>
                    type="text"
                    inputstyle="input"
                    label="your BU area"
                    placeholder="your area"
                    name="residence"
                    register={register}
                    error={errors.residence as any}
                    options={Object.values(Residences)}
                />
                <Select<DetailsFormData>
                    type="text"
                    inputstyle="input"
                    label="your college"
                    placeholder="your college"
                    name="college"
                    register={register}
                    error={errors.college as any}
                    options={Object.values(Colleges)}
                />
                <Button text="Submit" type="submit"
                    loading={loading}
                />
            </form>
    )
}
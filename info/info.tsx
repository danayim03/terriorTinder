import Button from "@/components/button/button";
import Input from "@/components/input/input";
import Select from "@/components/select/select";
import { useAuth } from "@/context/authcontext";
import { db } from "@/firebase/config";
import { OnboardingFormData } from "@/validation/form";
import { Genders } from "@/validation/models";
import { onboardingSchema } from "@/validation/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { doc, setDoc } from "firebase/firestore";
import { register } from "module";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

interface Props {
    callback?: () => void;
}

export default function InfoForm({ callback }: Props) {

    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);

    async function onSubmit(data: OnboardingFormData) {
        setLoading(true);
        console.log(data);



        const payload = {
            info: {
                firstname: data.firstname,
                age: data.age,
                gender: data.gender
            }
        }
        // get the user document, then the info col
        const userDoc = doc(db, "users", user!.email!);
        await setDoc(userDoc, payload, { merge: true });
        setLoading(false);
        callback && callback();
    }

    const { register, handleSubmit, control, formState: { errors } } =
        useForm<OnboardingFormData>({
            resolver: zodResolver(onboardingSchema),
            defaultValues: {}
        });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
                <Input<OnboardingFormData>
                    type="text"
                    inputstyle="input"
                    label="First Name"
                    placeholder="First Name"
                    name="firstname"
                    register={register}
                    error={errors.firstname}
                />
                <Input<OnboardingFormData>
                    type="number"
                    inputstyle="input"
                    label="Age"
                    placeholder="Age"
                    name="age"
                    register={register}
                    error={errors.age}
                />
                <Select<OnboardingFormData>
                    type="text"
                    inputstyle="input"
                    label="Gender"
                    placeholder="Gender"
                    name="gender"
                    options={Object.values(Genders)}
                    register={register}
                    error={errors.gender}
                />
                <Button text="Submit" type="submit"
                    loading={loading}
                />
            </form>
    )
}
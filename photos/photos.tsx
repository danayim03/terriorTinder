import Button from "@/components/button/button";
import Check from "@/components/check/check";
import Input from "@/components/input/input";
import Select from "@/components/select/select";

import { useAuth } from "@/context/authcontext";
import { db, storage } from "@/firebase/config";
import { PhotosFormData, GenericFormField } from "@/validation/form";
import { PGenders } from "@/validation/models";
import { photosSchema, preferencesSchema } from "@/validation/schema";

import { zodResolver } from "@hookform/resolvers/zod";
import { doc, setDoc } from "firebase/firestore";
import { register } from "module";
import React, { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import s from './photos.module.scss';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { URI } from "@/context/switch";

interface Props {
    callback?: () => void;
}

export default function PhotosForm({ callback }: Props) {

    const { user } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const [status, setStatus] = useState<string>("");

    function checkexplicit(image: File) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result?.toString();
                console.log(URI + "/check-explicit");
                const response = await fetch(`${URI}/check-explicit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ image: base64 })
                });
    
                const data = await response.json();
                if (response.status === 200) {
                    resolve(data);
                } else {
                    reject(data);
                }
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(image);
        });
    }

    function checkexistsface(image: File) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async () => {
                const base64 = reader.result?.toString();
                console.log(URI + "/check-face-exists");
                const response = await fetch(`${URI}/check-face-exists`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ image: base64 })
                });
                console.log(response);
                const data = await response.json();
                if (response.status === 200) {
                    resolve(data);
                } else {
                    reject(data);
                }
            };
            reader.onerror = error => reject(error);
            reader.readAsDataURL(image);
        });
    }


    async function onSubmit(data: PhotosFormData) {
        setLoading(true);
        console.log(data);

        // check if the images are unique
        let images = Object.values(data).filter((image) => (image !== undefined))
        console.log(images);
        let inames = images.map((image) => image.name);
        let unique = new Set(inames);
        if (unique.size !== inames.length) {
            console.log("images are not unique");
            setStatus("images are not unique");
            setLoading(false);
            return;
        }

        // check that no promises were rejected
        let failed = false;
        setStatus("making sure no images are naughty...");
        await Promise.all(images.map(image => {
            return checkexplicit(image).catch(() => {
                console.log("naughty image");
                setStatus("no boobs allowed >:(");
                setLoading(false);
                failed = true;
            });
        }))
        if (failed) {return;}

        // check that at least one image has a face
        let facefound = false;
        setStatus("making sure you have a face in at least one image...");
        await Promise.all(images.map(image => {
            return checkexistsface(image).then(() => {
                facefound = true;
            }).catch(() => {
                console.log("no face found");
            });
        }));
        if (!facefound) {
            console.log("no face found");
            setStatus("no face found");
            setLoading(false);
            return;
        }

        // this should in reality be done server side

        // if all good, upload the images
        setStatus("all good! ...");

        // put the image in the storage bucket under the user's email
        const uploadPromises = images.map((image) => {
            const uploadTask = uploadBytes(ref(storage, `${user!.email}/${image.name}`), image);
            return uploadTask.then((snapshot) => {
                console.log('Uploaded a blob or file!');
                console.log(snapshot);
                return getDownloadURL(snapshot.ref);
            })
        });

        const iurls = await Promise.all(uploadPromises)
        console.log(iurls);

        // then update the user's document with the image bucket urls
        const payload = { photos: iurls }
        const userDoc = doc(db, "users", user!.email!);
        await setDoc(userDoc, payload, { merge: true });


        setLoading(false);
        callback && callback();
    }

    const { register, handleSubmit, control, formState: { errors } } =
        useForm<PhotosFormData>({
            resolver: zodResolver(photosSchema),
            defaultValues: {

            }
        });

    const [previewImaages, setPreviewImages] = useState<{ [idx: number]: string }>({});
    return (
        <form onSubmit={handleSubmit(onSubmit)} className={s.form}>
            <div className={s.photos}>
                {
                    Array.from({ length: 6 }, (_, i) => i).map((index) => {
                        const name = `p${index + 1}` as "p1" | "p2" | "p3" | "p4" | "p5" | "p6";
                        return (
                            <Controller
                                name={name}
                                control={control}
                                render={({ field: { ref, name, onBlur, onChange } }) => (
                                    <div className={s.photo}>
                                        <label htmlFor={name} className={s.upload}>
                                            <span>+</span>
                                        </label>
                                        <input
                                            id={name}
                                            type="file"
                                            accept="image/*"
                                            ref={ref}
                                            name={name}
                                            onBlur={onBlur}
                                            onChange={(e) => {
                                                const file = e.target.files![0];
                                                const reader = new FileReader();
                                                reader.onload = (e) => {
                                                    setPreviewImages({ ...previewImaages, [index]: e.target!.result as string });
                                                }
                                                reader.readAsDataURL(file);
                                                console.log(e.target.files?.[0]);
                                                onChange(e.target.files?.[0])
                                            }}
                                        />
                                        {
                                            previewImaages[index] && <img src={previewImaages[index]} alt="preview" />
                                        }
                                        <span className={s.error}>
                                            {errors[name]?.message}
                                        </span>
                                    </div>
                                )}
                            />
                        )
                    })
                }
            </div>


            <div className={s.invalid}>{status && status}</div>


            <Button text="Submit" type="submit"
                loading={loading}

                onClick={
                    () => {
                        console.log("submitting photos");
                        console.log(errors)
                    }
                }
            />
        </form>
    )
}
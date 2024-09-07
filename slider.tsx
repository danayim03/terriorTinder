import React from "react";
import ReactSlider from "react-slider";
import { Controller, FieldValues, Path, PathValue } from 'react-hook-form';
import s from "./slider.module.scss";
import { GenericFormField } from "@/validation/form";

export default function Slider<T extends FieldValues>({ type, inputstyle, label, placeholder, name, control, register, error, disabled, defaultvalue }: GenericFormField<T>) {
    
    

    return (
        <div className={s.wrapper}>
            {label && <label htmlFor={name}>{label}</label>}
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <ReactSlider
                        className={s.slider}
                        thumbClassName={s.thumb}
                        value={field.value}
                        onAfterChange={(values) => {
                            field.onChange(values);
                        }}
                        trackClassName={s.track}
                        ariaValuetext={state => `Thumb value ${state.valueNow}`}
                        renderThumb={(props, state) => <div {...props}>{state.valueNow}</div>}
                        pearling
                        step={1}
                        minDistance={0}
                        min={18}
                        max={24}
                    />
                )}
            />
            {error && <span className={s.error}>*{error.message}</span>}
        </div>
    )
}
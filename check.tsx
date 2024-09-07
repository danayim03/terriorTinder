import { FieldValues } from "react-hook-form";
import s from "./check.module.scss";
import { GenericFormField } from "@/validation/form";

export default function Check<T extends FieldValues>({ type, inputstyle, label, placeholder, name, register, error, disabled, defaultvalue, options }: GenericFormField<T>) {
    return (
        <div className={s.matchcheck}>
            <label htmlFor={name}>{label ? label : name}:</label>

            {
                options?.map((option, index) => {
                    return (
                        <div key={index} className={s.checkbox}>
                            <input
                                type="checkbox"
                                value={option}
                                {...register(name)}
                            />
                            <label htmlFor={option.toString()}>{option}</label>
                        </div>
                    )
                })
            }
            {error && <span className={s.error}>{error.message}</span>}
        </div>
    )
}
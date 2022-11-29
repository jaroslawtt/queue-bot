import React, {ReactEventHandler, useState} from "react";


export const useForm = () => {
    
    const [formState, setFormState] = useState({
        queue_name: ``,
        students_number: 0,
    });
    const handleNameChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({
            ...formState,
            queue_name: target.value,
        })
    };
    const handleStudentsNumberChange = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
        setFormState({
            ...formState,
            students_number: parseInt(target.value),
        })
    };

    return { formState, handleNameChange, handleStudentsNumberChange };
}
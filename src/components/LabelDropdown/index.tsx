import React, { useState, useEffect } from 'react';
import { get as _get } from 'lodash';
import CreatableSelect from 'react-select/creatable';

interface Option {
    label: string;
    value: string;
    color: string;
}

export default ({ loading, children, className, onChangeOption, defaultMenuIsOpen, menuPlacement, ...props }: any) => {
    const [isLoading, setIsLoading] = useState(false);
    const [value, setValue] = useState<Option | null>();

    const customStyles = {
        control: (base: any, state: any) => ({
            ...base,
            background: "#F5F5F5",
            border: 'none',
            height: '40px',
        }),
        menuList: (base: any, state: any) => ({
            ...base,
            height: '280px'
        })
    };

    return (
        <CreatableSelect
            defaultMenuIsOpen={defaultMenuIsOpen}
            menuPlacement={menuPlacement}
            isDisabled={isLoading}
            isLoading={isLoading}
            // onChange={(newValue) => handleChange(newValue!)}
            // onCreateOption={handleCreate}
            // options={_get(DAO, 'options', [])}
            styles={customStyles}
            value={value}
            placeholder={"Add Label"}
        />
    )
}

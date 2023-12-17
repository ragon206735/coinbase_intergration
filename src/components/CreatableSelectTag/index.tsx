import React,{useState,useEffect} from 'react';
import { get as _get} from 'lodash';
import CreatableSelect from 'react-select/creatable';
import { Box } from '@mui/material';
import { useAppDispatch } from 'helpers/useAppDispatch';
import { useAppSelector } from 'helpers/useAppSelector';
import { useDAO } from 'context/dao';
import axiosHttp from 'api'
import { setDAOTagOptionsAction } from 'store/actions/dao';

// import { createDaoOption} from 'state/dashboard/actions'
// import { resetCreateOptionLoader} from 'state/dashboard/reducer';
// import { useAppDispatch,useAppSelector } from "state/hooks";

interface Option {
    label: string;
    value: string;
    color: string;
}

export default ({ loading, children, className,onChangeOption,defaultMenuIsOpen,menuPlacement, ...props }: any) => {
    const dispatch = useAppDispatch();
    const { DAO, createOptionLoading } = useDAO();
    const [isLoading, setIsLoading] = useState(false);
    const [value, setValue] = useState<Option | null>();


    const createOption = (label: string) => ({
        label,
        value: label,
        color:"#000000".replace(/0/g,function(){return (~~(Math.random()*16)).toString(16);})
    });

    const handleCreate = (inputValue: string) => {
        setIsLoading(true);
        const newOption = createOption(inputValue);
        axiosHttp.patch(`dao/${DAO?.url}/create-option`, { newOption })
        .then(res => {
            dispatch(setDAOTagOptionsAction(res?.data?.options))
            handleChange(newOption);
        })
        .finally(() => setIsLoading(false))
    };

    const handleChange = (newValue:Option) => {
        setValue(newValue);
        onChangeOption(newValue);
    }

    const customStyles = {
        control: (base:any, state:any) => ({
          ...base,
          background: "#F5F5F5",
          border:'none',
          height:'40px',
        }),
        menuList: (base:any, state:any) => ({
            ...base,
            height:'280px'
        })
      };

    return (
        <CreatableSelect
            defaultMenuIsOpen={defaultMenuIsOpen}
            menuPlacement={menuPlacement}
            isDisabled={isLoading}
            isLoading={isLoading}
            onChange={(newValue) => handleChange(newValue!)}
            onCreateOption={handleCreate}
            options={_get(DAO,'options',[])}
            styles={customStyles}
            value={value}
            placeholder={"Add Label"}
        />
    )
}

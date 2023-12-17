import React from "react";
import { Box } from "@mui/material"
import { ReactComponent as DropdownRed } from 'assets/svg/dropdown-red.svg';
import { ReactComponent as DropupRed } from 'assets/svg/dropup-red.svg';
import { ReactComponent as ArrowDown } from "assets/svg/dropdown.svg";
import MenuItem from '@mui/material/MenuItem';
import {
    Select,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
  } from "@chakra-ui/react";
import { makeStyles } from '@mui/styles';
import TextInput from 'components/TextInput';
import IconButton from "components/IconButton";
import { useState } from "react";


const useStyles = makeStyles((theme) => ({

}));

export default ({ onChange, value, height = 40, width = 54, ...props }) => {
    const classes = useStyles()
    return (
        <NumberInput isDisabled={props?.disabled} value={value} onChange={e => onChange(e)} style={{ width: (width + 50), height, borderRadius: '10px 10px 10px 10px', boxShadow: 'inset -1px 0px 4px rgba(27, 43, 65, 0.1)' }} step={1} min={0}>
            <NumberInputField className='input' style={{ padding: 0, textAlign: "center", height, width: width, backgroundColor: '#F5F5F5', borderRadius: '10px 0px 0px 10px', borderWidth: 0 }} />
            <NumberInputStepper style={{ width: 50, backgroundColor: 'transparent', borderRadius: '10px 10px 10px 10px' }}>
                <NumberIncrementStepper color="#C94B32" children={<DropupRed />} />
                <NumberDecrementStepper color="#C94B32" children={<DropdownRed />} style={{ borderTopWidth: 0 }} />
            </NumberInputStepper>
        </NumberInput>
    )
}
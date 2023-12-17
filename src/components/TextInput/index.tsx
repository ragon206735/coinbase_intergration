import React from 'react';
import { Typography, Box, TextField, FormControl, FormLabel, Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const  MenuProps = {
    MenuProps:{
        PaperProps: { sx: { maxHeight: 300 } } 
      },
  }

const useStyles = makeStyles((theme: any) => ({
    root: {
        "& .MuiFormHelperText-root": {
            color: '#FFF',
            backgroundColor: '#EA6447',
            borderRadius: '0 0 5px 5px',
            padding: '5px 10px',
            marginTop: '0'
        },
        "& .MuiFormHelperText-root.Mui-error": {
            color: '#FFF',
        }
    }
}));

export default ({ labelChip, fullWidth, label, date, ...props }: any) => {
    const classes = useStyles();
    return (
        <FormControl fullWidth={fullWidth}>
            <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                { label && <FormLabel style={{ marginBottom: "10px" }} error={props.error} component="legend">{label}</FormLabel> }
                {labelChip}
            </Box>
            {   date ?
                <DatePicker {...props} className={classes.root} /> :
                <TextField {...props} SelectProps={MenuProps}  className={classes.root} />
            }
        </FormControl>
    )
}
import React, { useEffect, useState } from 'react';
import { Box, MenuItem, FormControl } from "@mui/material";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { makeStyles } from '@mui/styles';
import clsx from "clsx";
import Avatar from 'components/Avatar';

type propTypes = {
	options?: any[],
	selected?: any,
	selectStyle?: any,
	errorSelect?: string,
	disabled?: boolean,
	type?: string,
	setSelectedValue: (event: any) => void
}

const useStyles = makeStyles((theme: any) => ({
	customSelect: {
		width: '100%',
	},
	customSelectError: {
		width: '100%',
		'& .MuiSelect-select': {
			border: '1px solid #EA6447',
		},
	}
}));

export default function MuiSelect({
	options,
	selected,
	selectStyle,
	errorSelect,
	setSelectedValue,
	disabled,
	type,
}: propTypes) {
	const classes = useStyles();
	const [activeOption, setActiveOption] = useState<number | string | undefined | null>(selected ? selected : 'Select');

	const [showMenuItem, setShowMenuItem] = React.useState(true);

	useEffect(() => {
		if (selected)
			setActiveOption(selected)
	}, [selected])

	const handleChange = (event: SelectChangeEvent) => {
		if (!!event.target.value) {
			setActiveOption(event.target.value);
			setSelectedValue(event.target.value)
		}
	};
	return (
		<FormControl sx={{ width: '100%', ...selectStyle }}>
			<Box sx={{ width: '100%' }} display="flex" flexDirection="column" alignItems="center">
				<Select
					className={errorSelect ? clsx(classes.customSelectError) : clsx(classes.customSelect)}
					// @ts-ignore
					value={activeOption}
					onChange={handleChange}
					displayEmpty
					inputProps={{ 'aria-label': 'Without label', id: 'mui-dropdown' }}
					onOpen={() => {
						setShowMenuItem((prev) => false);
					}}
					onClose={() => {
						setShowMenuItem((prev) => true);
					}}
					disabled={disabled}
					MenuProps={{
						PaperProps: {
							sx: {
								maxHeight: '200px'
							},
						},
					}}
				>
					<MenuItem value="Select" style={{ display: showMenuItem ? "block" : "none" }}>Select</MenuItem>
					{
						options?.map((option, index) => {
							if (type === 'members') {
								return (
									<MenuItem
										value={option?.value}
										key={index}
									>
										<Avatar
											name={option.label.name}
											wallet={option.label.wallet}
										/>
									</MenuItem>
								)
							}
							else {
								return (
									<MenuItem
										value={option?.value}
										key={index}
									>
										{option.label}
									</MenuItem>
								)
							}
						})}
				</Select>
				{errorSelect && <span style={{ background: '#EA6447', padding: '5px 10px', borderRadius: '0 0 5px 5px', color: '#FFF', textAlign: 'center', width: '90%', fontSize: '11px' }}>{errorSelect}</span>}
			</Box>
		</FormControl>
	);
}
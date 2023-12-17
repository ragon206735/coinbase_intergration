// @ts-nocheck
import * as React from 'react'
import { styled } from '@mui/material/styles'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'

const CHECKMARK = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_2430_2610)">
<path d="M6.3999 10.8676L10.423 16.7053L17.9126 7.12695" stroke="white" stroke-linecap="round"/>
</g>
<defs>
<clipPath id="clip0_2430_2610">
<rect width="12.5529" height="10.7596" fill="white" transform="translate(5.87988 6.58301)"/>
</clipPath>
</defs>
</svg>
`

const LOCK = `<svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg">
<g clip-path="url(#clip0_1635_2096)">
<path d="M10.26 6.21997H1.62C1.00144 6.21997 0.5 6.72141 0.5 7.33997V12.91C0.5 13.5285 1.00144 14.03 1.62 14.03H10.26C10.8786 14.03 11.38 13.5285 11.38 12.91V7.33997C11.38 6.72141 10.8786 6.21997 10.26 6.21997Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M9.20992 5.94V3.77C9.20992 1.96 7.74992 0.5 5.93992 0.5C4.12992 0.5 2.66992 1.96 2.66992 3.77V6.08" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.93994 10.28V11.96" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M5.93995 10.2C6.48671 10.2 6.92995 9.75673 6.92995 9.20997C6.92995 8.66321 6.48671 8.21997 5.93995 8.21997C5.39319 8.21997 4.94995 8.66321 4.94995 9.20997C4.94995 9.75673 5.39319 10.2 5.93995 10.2Z" stroke="white" stroke-linecap="round" stroke-linejoin="round"/>
</g>
<defs>
<clipPath id="clip0_1635_2096">
<rect width="11.88" height="14.53" fill="white"/>
</clipPath>
</defs>
</svg>`

const MaterialUISwitch = styled(Switch)(({ theme, unidirectional }) => ({
  width: 65,
  height: 30,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    transform: 'translateX(3px)',
    marginTop: 2,
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(36px)',
      '& .MuiSwitch-thumb': {
        backgroundColor: theme.palette.primary.main,
        boxShadow: 'none',
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#f0f0f0',
      },
    },
  },
  '& .MuiFormControlLabel-root': {
    marginLeft: '0px !important',
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: unidirectional ? '#c94b32' : theme.palette.primary.main,
    boxShadow: 'none',
    width: 26,
    height: 26,
    borderRadius: 10,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
    },
  },
  '& .MuiSwitch-track': {
    boxShadow: 'inset 1px 0 4px rgb(27 43 65 / 10%)',
    cursor: 'pointer',
    backgroundColor: '#f0f0f0',
    opacity: 1,
    //   backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 10,
  },
}))

export default ({
  label,
  checkedSVG,
  checked,
  unidirectional = true,
  ...props
}: any) => {
  return (
    <FormControlLabel
      sx={{ margin: '0' }}
      control={
        <MaterialUISwitch
          unidirectional={unidirectional}
          checkedSVG={CHECKMARK}
          sx={{ mr: 1 }}
        />
      }
      label={label}
      {...props}
      checked={checked}
    />
  )
}

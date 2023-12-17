import React from 'react';
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

export default styled(({ className, ...props }: TooltipProps) => {
  console.log('....tooltip looged', props)
  return (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  )})(({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: '#1B2B41'
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: '#1B2B41',
      maxWidth: 187,
      fontSize: theme.typography.pxToRem(14),
      margin: 10,
      borderRadius: 5
    },
  }))
  ;

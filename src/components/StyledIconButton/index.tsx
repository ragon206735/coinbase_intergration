
import { ButtonProps, styled, IconButton } from "@mui/material";
import React from "react";

const StyledIconButton = styled(IconButton)<{
    variant?: Exclude<ButtonProps['variant'], 'text'>;
    style: any;
}>(({ theme, variant, color, style }) => {
    const overrides: any = {};

    const colorAsVariant = color === undefined || color === 'inherit' || color === 'default' ? 'primary' : color;

    if (variant === 'contained') {
        overrides.backgroundColor = theme.palette[colorAsVariant].main;
        overrides.color = theme.palette[colorAsVariant].contrastText;
        overrides.borderRadius = style?.borderRadius || 5;
        overrides[':hover'] = {
            backgroundColor: theme.palette[colorAsVariant].dark,
        };
    }

    if (variant === 'outlined') {
        overrides.border = `1px solid ${theme.palette[colorAsVariant].main}`;
        overrides.color = theme.palette[colorAsVariant].main;
    }

    return {
        ...overrides,
    };
});

export default StyledIconButton
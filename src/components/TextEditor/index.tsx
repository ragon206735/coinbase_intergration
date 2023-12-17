import React, { useEffect, useRef } from 'react';
import { Typography, Box, TextField, FormControl, FormLabel, Chip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Editor } from '@tinymce/tinymce-react';

export default ({ labelChip, fullWidth, height, width, placeholder, value, onChange, label, ...props }: any) => {
    const editorRef = useRef(null);

    return (
        <FormControl fullWidth={fullWidth}>
            <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
                <FormLabel error={props.error} component="legend" sx={{ marginBottom: '10px' }}>{label}</FormLabel>
                {labelChip}
            </Box>
            <Box sx={{ width: '100%' }} display={"flex"} flexDirection={"column"} alignItems={"center"}>
                <Editor
                    apiKey='p0turvzgbtf8rr24txekw7sgjye6xunw2near38hwoohdg13'
                    onInit={(evt: any, editor: any) => editorRef.current = editor}
                    init={{
                        height,
                        width,
                        placeholder,
                        menubar: false,
                        statusbar: false,
                        toolbar: false,
                        branding: false,
                        body_class: "mceBlackBody",
                        default_link_target: "_blank",
                        extended_valid_elements: "a[href|target=_blank]",
                        link_assume_external_targets: true,
                        content_css:'/tinymce.css',
                        plugins: [
                            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                        ],
                    }}
                    value={value}
                    onEditorChange={(text) => { onChange(text) }}
                />
                {props.error && <span style={{ background: '#EA6447', padding: '5px 10px', borderRadius: '0 0 5px 5px', color: '#FFF', textAlign: 'center', width: '90%', fontSize: '11px' }}>{props.helperText}</span>}
            </Box>
        </FormControl>
    )
}
import React, { useRef, useCallback, useEffect, useState } from "react";
import { read, utils, writeFileXLSX } from 'xlsx';
import uploadIcon from '../../assets/svg/uploadIcon.svg';
import { Tooltip } from "@chakra-ui/react";

const ToolTopContainer = React.forwardRef(({ children, ...rest }, ref) => (
  <div className="uploadBtn" ref={ref} {...rest}>
    {children}
  </div>
))


export default ({ onComplete, ...props }) => {

  const hiddenFileInput = useRef(null);

  const handleUpload = async (f) => {
    const d = await f.arrayBuffer();
    let wb = read(d);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = utils.sheet_to_json(ws);
    console.log(data)
    onComplete(data)
  }

  const handleClick = () => {
    hiddenFileInput?.current?.click()
  };

  const handleChange = (event) => {
    event.preventDefault();
    const fileUploaded = event.target.files[0];
    event.target.value = ''
    handleUpload(fileUploaded);
  };

  const uploadBtnStyle = {
    width: '185px',
    height: '40px',
    background: '#FFFFFF',
    boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1)',
    borderRadius: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#76808D',
    border: 'none',
  }

  return (
    <>
      <Tooltip placement='top' label={`Please upload .xlsx file with columns containing member name and wallet address`}>
        <ToolTopContainer>
          <button style={uploadBtnStyle} onClick={handleClick}>
            <img src={uploadIcon} alt="uploadIcon" style={{ marginRight: '10px' }} />
            OR UPLOAD FILE
          </button>
        </ToolTopContainer>
      </Tooltip>
      <input type="file" ref={hiddenFileInput} onChange={handleChange} style={{ display: 'none' }} />
    </>
  );
}
import React, { useState, useRef, useEffect} from 'react'
import _ from 'lodash'
import lomadsfulllogo from '../../assets/svg/lomadsfulllogo.svg'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import { LeapFrog } from '@uiball/loaders'
import axiosHttp from '../../api'
import Switch2 from 'components/Switch/index.v2'
// import { nanoid } from "@reduxjs/toolkit";
// import { useDropzone } from 'react-dropzone'
import Button from 'components/Button'
import uploadIconOrange from '../../assets/svg/ico-upload-orange.svg'
import { Container, Grid, Typography, Box } from '@mui/material'
import { toast } from 'react-hot-toast'
import { makeStyles } from '@mui/styles'
import { useAppDispatch } from 'helpers/useAppDispatch'
import { useWeb3Auth } from 'context/web3Auth'
import { useAppSelector } from 'helpers/useAppSelector'
import { useDAO } from 'context/dao'
import IconButton from "components/IconButton"
import LINK_SVG from 'assets/svg/ico-link.svg'

const useStyles = makeStyles((theme: any) => ({
  root: {
    minHeight: '100vh',
    maxHeight: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden !important',
  },
  maxText: {
    color: '#1B2D41',
    opacity: 0.2,
    letterSpacing: '-0.011em',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: 14,
  },
  chooseText: {
    color: '#C94B32',
    alignSelf: 'center',
    letterSpacing: '-0.011em',
    fontFamily: 'Inter, sans-serif',
    fontWeight: 400,
    fontSize: 16,
  },
  text: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: 14,
    letterSpacing: '-0.011em',
    color: '#76808d',
    opacity: 0.5,
    marginLeft: 13,
  },
  headerText: {
    fontFamily: 'Insignia',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: 35,
    paddingTop: 159,
    paddingBottom: 35,
    textAlign: 'center',
    color: '#C94B32',
  },
  inputFieldTitle: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: '-0.011em',
    color: '#76808D',
    margin: '20px 0px 10px 0px',
  },
  createName: {
    margin: '25px 0px 15px 0px',
  },
  lomadsLogoParent: {
    backgroundColor: '#FFF',
    height: '100vh',
    zIndex: 99999,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyItems: 'center',
    background: '#FFFFFF',
    boxShadow:
      '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1)',
    borderRadius: 5,
    width: 394,
    padding: '10px 22px 22px 22px',
    minHeight: 'fit-content',
  },
  imagePickerWrapperText: {
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: 16,
    color: 'rgba(118, 128, 141, 0.5)',
    marginLeft: 13,
  },
  imagePickerWrapper: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  imagePickerContainer: {
    // width: 200,
    // height: 200,
    // borderRadius: 10,
    // display: 'flex',
    // flexDirection: 'column',
    // alignItems: 'center',
    // justifyContent: 'center',
    // background: '#F5F5F5',
    // boxShadow: 'inset 1px 0px 4px rgba(27, 43, 65, 0.1)',
    // cursor: 'pointer',
    // position: 'relative',
    // overflow: 'hidden'
  },
  informationPerm: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'italic',
    weight: 400,
    fontSize: 14,
    textAlign: 'center',
    color: '#76808D',
  },
  selectedImg: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    objectFit: 'cover',
  },
  uploadIcon: {
    margin: 10,
  },
}))

export default () => {

  const { daoURL } = useParams()
  const { DAO } = useDAO()

  console.log('location: ', window.location.origin)

  const [onboardingMethod, setOnboardingMethod] = useState<boolean>(false)

  const handleOnboardingMethod = (value: boolean) => {
    setOnboardingMethod(!value)
  }
  const classes = useStyles()
  //@ts-ignore
  const { user } = useAppSelector((store) => store.session)
  const { chainId, account } = useWeb3Auth()
  const [createDAOLoading, setCreateDAOLoading] = useState<boolean>(false)
  const [DAOListLoading, setDAOListLoading] = useState<boolean>(false)
  const navigate = useNavigate()

  const [state, setState] = useState<any>({})

  console.log('memebership dao: ', DAO)

  return (
    <Container>
      <Grid className={classes.root}>
        {DAOListLoading ? (
          <Box className={classes.lomadsLogoParent}>
            <img
              src={lomadsfulllogo}
              alt=''
            />
            <LeapFrog
              size={50}
              color='#C94B32'
            />
          </Box>
        ) : null}
        <Grid
          item
          sm={12}
          display='flex'
          flexDirection='column'
          alignItems='center'
          justifyContent='center'
        >
          <Box className={classes.headerText}>3/3 Membership Policy</Box>
          <Box>
            <Typography sx={{ textAlign: 'center', fontSize: '1rem' }}>
                At Lomads, we offer a tiered system of roles: admins, core contributors,<br />
                active contributors, and contributors. Each comes with unique permissions<br />
                and access. for more details, review the roles in Settings.<br />
            </Typography>

            <Typography sx={{ textAlign: 'center', fontSize: '20px', color: '#C94B32', fontWeight: 'bold', marginTop: '80px' }}>
                CHOOSE YOUR MEMBER ONBOARDING METHOD
            </Typography>

            <Typography sx={{ textAlign: 'center', padding: '20px 0' }}>
                Onboarding settings can be altered anytime via Settings {'>'} Membership <br />
                Management. 
            </Typography>

            <Box
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
            <Typography
              sx={{
                fontSize: '17px',
                color: onboardingMethod ? '' : '#c94b32',
                marginRight: '15px',
              }}
            >
              OPEN FOR ALL
            </Typography>
            <Switch2
              onChange={() => handleOnboardingMethod(onboardingMethod)}
              checked={onboardingMethod}
            />
            <Typography
              sx={{
                fontSize: '17px',
                color: onboardingMethod ? '#c94b32' : '',
                marginLeft: '15px',
              }}
            >
              WHITELISTED
            </Typography>
          </Box>
          <Typography sx={{ textAlign: 'center', width: '100%', fontSize: '0.8rem', fontWeight: 'bold', margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                Use this link to welcome new members: 
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#c94b32', marginLeft: '10px' }}> 
                    { DAO?.name } 
                    <IconButton onClick={(e:any) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(`${window.location.origin}/${daoURL}`)
                                toast.success('Copied to clipboard')
                        }}>
                            <img src={LINK_SVG} style={{ width: '14px' }} />
                    </IconButton></Typography> <br />
            </Typography>
            <Typography sx={{ textAlign: 'center', fontSize: '0.7rem' }}>This invitation is also accessible from your dashboard.</Typography>
            <Typography sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                New members are automatically assigned the 'Contributors' role.
            </Typography>
          </Box>
          <Box className={classes.createName} sx={{ marginTop: '60px' }}>
            <Button
              loading={createDAOLoading}
              variant='contained'
              size='medium'
              onClick={() => {
                navigate(`/${daoURL}/welcome`)
            }}
            >
              GO TO DASHBOARD
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

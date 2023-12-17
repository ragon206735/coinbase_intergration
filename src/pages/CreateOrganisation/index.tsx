import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import _ from 'lodash'
import lomadsfulllogo from '../../assets/svg/lomadsfulllogo.svg'
import { useNavigate, useLocation } from 'react-router-dom'
import TextInput from 'components/TextInput'
import { LeapFrog } from '@uiball/loaders'
import axiosHttp from '../../api'
import Dropzone from 'components/Dropzone'
import ReactS3Uploader from 'components/ReactS3Uploader'
// import { nanoid } from "@reduxjs/toolkit";
// import { useDropzone } from 'react-dropzone'
import Button from 'components/Button'
import uploadIconOrange from '../../assets/svg/ico-upload-orange.svg'
import { Container, Grid, Typography, Box } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { useAppDispatch } from 'helpers/useAppDispatch'
import { useWeb3Auth } from 'context/web3Auth'
import { useAppSelector } from 'helpers/useAppSelector'

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
  const classes = useStyles()
  //@ts-ignore
  const { user } = useAppSelector((store) => store.session)
  const { chainId, account } = useWeb3Auth()
  const dispatch = useAppDispatch()
  const [createDAOLoading, setCreateDAOLoading] = useState<boolean>(false)
  const [DAOListLoading, setDAOListLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<any>({})
  const [urlCheckLoading, setUrlCheckLoading] = useState<any>(false)
  const navigate = useNavigate()

  const [state, setState] = useState<any>({})

  const handleClick = () => {
    let terrors: any = {}
    if (!state?.daoName) {
      terrors.daoName = ' * Organisation name is required.'
    }
    if (!state?.url) {
      terrors.url = ' * Organisation url is required.'
    }
    if (_.isEmpty(terrors)) {
      const daoPayload = {
        chainId,
        name: state?.daoName,
        url: state?.url?.replace(`${process.env.REACT_APP_URL}/`, ''),
        description: '',
        image: state.logo,
        members: [
          {
            name: user?.name || '',
            address: account,
            creator: true,
            role: 'role1',
          },
        ],
      }
      setCreateDAOLoading(true)
      axiosHttp
        .post('dao', daoPayload)
        .then((result) => {
          navigate(`/${daoPayload?.url}/attach-safe/new`, {
            replace: true,
            state: { createFlow: true },
          })
        })
        .finally(() => setCreateDAOLoading(false))
    } else {
      setErrors(terrors)
    }
  }

  const checkAvailability = (name: string) => {
    if (name && name !== '') {
      setUrlCheckLoading(true)
      axiosHttp
        .get(`dao/${name.replace(/ /g, '-').toLowerCase()}`)
        .then((res) => {
          if (!res.data) {
            setState((prev: any) => {
              return {
                ...prev,
                url:
                  process.env.REACT_APP_URL +
                  '/' +
                  name.replace(/ /g, '-').toLowerCase(),
              }
            })
          } else {
            let rand = Math.floor(1000 + Math.random() * 9000)
            axiosHttp
              .get(`dao/${name.replace(/ /g, '-').toLowerCase() + '-' + rand}`)
              .then((result) => {
                rand = Math.floor(1000 + Math.random() * 9000)
                setState((prev: any) => {
                  return {
                    ...prev,
                    url:
                      process.env.REACT_APP_URL +
                      '/' +
                      name.replace(/ /g, '-').toLowerCase() +
                      '-' +
                      rand,
                  }
                })
              })
              .catch((err) => {
                setState((prev: any) => {
                  return {
                    ...prev,
                    url:
                      process.env.REACT_APP_URL +
                      '/' +
                      name.replace(/ /g, '-').toLowerCase() +
                      '-' +
                      rand,
                  }
                })
              })
          }
        })
        .catch((err) => {
          setState((prev: any) => {
            return {
              ...prev,
              url:
                process.env.REACT_APP_URL +
                '/' +
                name.replace(/ /g, '-').toLowerCase(),
            }
          })
        })
        .finally(() => setUrlCheckLoading(false))
    } else {
      setState((prev: any) => {
        return { ...prev, url: '' }
      })
    }
  }

  const checkAvailabilityAsync = useRef(
    _.debounce(checkAvailability, 500)
  ).current

  useEffect(() => {
    checkAvailabilityAsync(state?.daoName)
  }, [state?.daoName])

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
          <Box className={classes.headerText}>
            1/3 Name of your Organisation
          </Box>
          <Box className={classes.centerCard}>
            <Box>
              <Box sx={{ mt: 2 }}>
                <TextInput
                  sx={{
                    width: 350,
                  }}
                  label='Name Your Organisation'
                  placeholder='Epic Organisation'
                  fullWidth
                  inputProps={{ maxLength: 50 }}
                  value={state?.daoName}
                  onChange={(event: any) => {
                    setErrors({})
                    //checkAvailabilityAsync(event)
                    const name = event.target.value.replace(/[^a-z0-9 ]/gi, '')
                    setState((prev: any) => {
                      return { ...prev, daoName: name.toString() }
                    })
                  }}
                  error={errors.daoName}
                  helperText={errors.daoName}
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                {/* <Box style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
									<Box 
										className={classes.inputFieldTitle}
										style={{ marginRight: '16px' }}>
												Organisation address
									</Box>
									{urlCheckLoading && <LeapFrog size={20} color="#C94B32" />}
								</Box> */}
                <TextInput
                  sx={{
                    width: 350,
                  }}
                  fullWidth
                  label='Organisation address'
                  disabled
                  value={state?.url}
                  placeholder='https://app.lomads.xyz/Name_of_the_Organisation'
                  onChange={(e: any) => {
                    setState((prev: any) => {
                      return { ...prev, daoName: e.target.value }
                    })
                  }}
                  error={errors.url}
                  helperText={errors.url}
                />
              </Box>
              <Box>
                <Box
                  className={classes.inputFieldTitle}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  Import Thumbnail <Box className='option-Box'>Optional</Box>
                </Box>
                <Box className={classes.imagePickerWrapper}>
                  <Box className={classes.imagePickerContainer}>
                    <Dropzone
                      value={state?.logo}
                      onUpload={(url: string) => {
                        setState((prev: any) => {
                          return { ...prev, logo: url }
                        })
                      }}
                    />
                  </Box>
                  <p className={classes.text}>
                    Accepted formats:
                    <br />
                    jpg, png
                  </p>
                </Box>
              </Box>
            </Box>
          </Box>
          <Box className={classes.createName}>
            <Button
              loading={createDAOLoading}
              variant='contained'
              size='medium'
              onClick={handleClick}
            >
              CREATE PUBLIC ADDRESS
            </Button>
            <Typography
              sx={{ mt: 2 }}
              className={classes.informationPerm}
            >
              This infomation is permanent
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

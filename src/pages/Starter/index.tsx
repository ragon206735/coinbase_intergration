import React, { useState, useEffect } from 'react'
import _ from 'lodash'
import lomadslogodark from '../../assets/svg/lomadslogodark.svg'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Box, Typography, Link, Container, Grid } from '@mui/material'
import { makeStyles } from '@mui/styles'
import Button from 'components/Button'
import { get as _get, set as _set } from 'lodash'

import axios from 'axios'
import TextInput from 'components/TextInput'
import logo from 'assets/svg/logo.svg'

import { useAppSelector } from 'helpers/useAppSelector'
import { useAppDispatch } from 'helpers/useAppDispatch'
import { updateCurrentUser } from 'store/actions/session'

import img1 from 'assets/svg/img1.svg'
import img2 from 'assets/svg/img2.svg'
import img3 from 'assets/svg/img3.svg'
import img4 from 'assets/svg/img4.svg'
import Footer from 'components/Footer'
import { useWeb3Auth } from 'context/web3Auth'

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
  DAOsuccess: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    textAlign: 'center',
    overflowY: 'auto',
    padding: '0 1rem !important',
    marginTop: '10vh !important',
  },
  italicHeader: {
    fontWeight: '300 !important',
    fontStyle: 'italic !important',
    fontSize: '38px !important',
    lineHeight: '42px !important',
    textAlign: 'center',
    color: '#C94B32',
    textTransform: 'uppercase',
  },
  boldHeader: {
    fontWeight: '800 !important',
    fontSize: '38px !important',
    lineHeight: '42px !important',
    textAlign: 'center',
    color: '#1B2B41',
    textTransform: 'uppercase',
  },
  row: {
    width: '100%',
    height: '247px',
    background: '#FFF',
    borderRadius: '5px !important',
    boxShadow:
      '-3px -3px 8px 0px rgba(201, 75, 50, 0.10), 3px 5px 4px 0px rgba(27, 43, 65, 0.05) !important',
    overflow: 'hidden !important',
    marginBottom: '40px !important',
  },
  rowText: {
    fontSize: '18px !important',
    fontWeight: '400 !important',
    lineHeight: '22px !important',
    color: '#76808D',
    textAlign: 'center',
  },
  subTitle: {
    fontSize: '22px !important',
    fontWeight: '400 !important',
    lineHeight: '30px !important',
    color: '#76808D',
    textAlign: 'center',
  },
}))

export default () => {
  const navigate = useNavigate()
  const classes = useStyles()

  const { user } = useAppSelector((store) => store.session)
  const { account } = useWeb3Auth()
  const dispatch = useAppDispatch()
  const [createDAOLoading, setCreateDAOLoading] = useState<boolean>(false)
  const [DAOListLoading, setDAOListLoading] = useState<boolean>(false)
  const [errors, setErrors] = useState<any>({})
  const [registered, setRegistered] = useState<boolean>(false)

  const [urlCheckLoading, setUrlCheckLoading] = useState<any>(false)

  const [editableName, setEditableName] = useState('default')

  const [state, setState] = useState<any>({})

  const handleClick = () => {
    let terrors: any = {}
    if (!state?.name) {
      terrors.name = ' *  Name is required.'
    }
    if (!state?.email) {
      terrors.email = ' * Email is required.'
    }
    if (!isValidEmail(state?.email)) {
      terrors.email = 'Email is invalid'
    }
    if (_.isEmpty(terrors)) {
      const data = {
        Name: state?.name,
        Email: state?.email,
        Wallet: account,
      }
      handleSubmit()

      axios
        .post(
          'https://sheet.best/api/sheets/4016caa6-e34c-4fe1-9bc5-6a993d032d94',
          data
        )
        .then((result) => {
          handleSubmit()
          console.log('data saved')
        })
    } else {
      setErrors(terrors)
      console.log(user)
    }
  }

  /*     useEffect(() => {
        if (user)
            setEditableName(_get(user,'name'))
    }, []); */

  const handleSubmit = () => {
    dispatch(updateCurrentUser({ name: state?.name }))
    dispatch(updateCurrentUser({ registered: true }))
  }

  const isValidEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  if (!user?.registered) {
    return (
      <>
        <Box className={classes.DAOsuccess}>
          <Container
            style={{ position: 'absolute', top: 0 }}
            maxWidth='xl'
          >
            <Box
              sx={{ mt: 3 }}
              display='flex'
              flexDirection='row'
              alignItems='center'
              style={{ float: 'left' }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  style={{
                    width: '200px',
                    marginRight: '60px',
                    marginBottom: '5px',
                    marginLeft: '16px',
                  }}
                  src={logo}
                  alt='logo'
                />
                <Link
                  rel='noopener noreferrer'
                  target='_blank'
                  href='https://www.notion.so/lomads/Lomads-Key-Features-Roadmap-0f0fbc49d063436f95c97f26c57479d8'
                  sx={{ mx: 2 }}
                  color='primary'
                  style={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  FEATURES
                </Link>
                <Link
                  rel='noopener noreferrer'
                  target='_blank'
                  href='https://www.lomads.xyz/blog'
                  sx={{ ml: 2, mr: 3 }}
                  color='primary'
                  style={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  BLOG
                </Link>
                <Link
                  rel='noopener noreferrer'
                  target='_blank'
                  href='https://lomads-1.gitbook.io/lomads/'
                  sx={{ ml: 2, mr: 3 }}
                  color='primary'
                  style={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  DOCS
                </Link>
                <Link
                  rel='noopener noreferrer'
                  target='_blank'
                  href='https://lomads.notion.site/Join-Lomads-as-a-Contributor-9678cce3e06744568cf722a09891a5cd'
                  sx={{ ml: 2, mr: 3 }}
                  color='primary'
                  style={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  CONTRIBUTE
                </Link>
              </div>
            </Box>
          </Container>

          <Box sx={{ marginTop: '100px', marginBottom: '20px' }}>
            <Typography className={classes.italicHeader}>
              Let's Get Started!
            </Typography>

            <Typography
              className={classes.subTitle}
              sx={{ mt: 4 }}
            >
              While you sign in with your wallet, we'd love to get to know you a
              bit more.{' '}
            </Typography>
            <Typography className={classes.subTitle}>
              This allows us to keep you in the loop about product updates.
            </Typography>
            <Container>
              <Grid
                item
                sm={12}
                display='flex'
                flexDirection='column'
                alignItems='center'
                justifyContent='center'
              >
                <Box className={classes.centerCard}>
                  <Box>
                    <Box sx={{ mt: 6 }}>
                      <TextInput
                        sx={{
                          width: 350,
                        }}
                        label='Enter your Name'
                        placeholder='John Doe'
                        inputProps={{ maxLength: 40 }}
                        fullWidth
                        value={state?.name}
                        onChange={(event: any) => {
                          setErrors({})
                          const value = event.target.value
                          setState((prev: any) => {
                            return { ...prev, name: value.toString() }
                          })
                          setEditableName(value)
                        }}
                        error={errors.name}
                        helperText={errors.name}
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <TextInput
                        sx={{
                          width: 350,
                        }}
                        label='Enter your Email'
                        placeholder='myemail@abc.com'
                        inputProps={{ maxLength: 100 }}
                        fullWidth
                        value={state?.email}
                        onChange={(event: any) => {
                          setErrors({})
                          const value = event.target.value
                          setState((prev: any) => {
                            return { ...prev, email: value.toString() }
                          })
                        }}
                        error={errors.email}
                        helperText={errors.email}
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Container>
            <Box
              display='flex'
              flexDirection='row'
              justifyContent='center'
            >
              <Button
                variant='contained'
                sx={{ marginTop: '41px' }}
                onClick={handleClick}
              >
                NEXT
              </Button>
            </Box>
          </Box>
          <Box
            sx={{ margin: '58px 0' }}
            display='flex'
            flexDirection='row'
            justifyContent='center'
          >
            <Typography
              sx={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#B12F15',
                lineHeight: '40px',
                marginBottom: '58px',
              }}
            >
              See what's inside
            </Typography>
          </Box>

          <Box
            className={classes.row}
            display={'flex'}
            alignItems={'center'}
          >
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              sx={{ height: '100%', width: '60%', background: '#FDF7F5' }}
            >
              <img src={img4} />
            </Box>
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              flexDirection={'column'}
              sx={{ width: '40%' }}
            >
              <Typography
                className={classes.rowText}
                sx={{ marginBottom: '25px' }}
              >
                Streamlined{' '}
                <span style={{ fontWeight: '700' }}>
                  multi-treasury transaction
                </span>
                <br />
                management
              </Typography>
              <Typography className={classes.rowText}>
                Hassle-free{' '}
                <span style={{ fontWeight: '700' }}>financial reporting</span>{' '}
                with
                <br />
                <span style={{ fontWeight: '700' }}>automated labeling</span>
              </Typography>
            </Box>
          </Box>

          <Box
            className={classes.row}
            display={'flex'}
            alignItems={'center'}
          >
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              flexDirection={'column'}
              sx={{ width: '40%' }}
            >
              <Typography className={classes.rowText}>
                Versatile{' '}
                <span style={{ fontWeight: '700' }}>
                  token based memberships
                </span>
                <br />
                sell, whitelist, and beyond
              </Typography>
            </Box>
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              sx={{ height: '100%', width: '60%', background: '#FDF7F5' }}
            >
              <img
                src={img3}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Box>

          <Box
            className={classes.row}
            sx={{ height: '192px' }}
            display={'flex'}
            alignItems={'center'}
          >
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              sx={{ height: '100%', width: '60%', background: '#F5F5F5;' }}
            >
              <img src={img2} />
            </Box>
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              flexDirection={'column'}
              sx={{ width: '40%' }}
            >
              <Typography className={classes.rowText}>
                <span style={{ fontWeight: '700' }}>
                  Effortless integrations
                </span>
                <br />
                and <span style={{ fontWeight: '700' }}>
                  auto-permissions
                </span>{' '}
                with Notion, Discord,
                <br />
                Github via membership tokens
              </Typography>
            </Box>
          </Box>

          <Box
            className={classes.row}
            display={'flex'}
            alignItems={'center'}
          >
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              flexDirection={'column'}
              sx={{ width: '40%' }}
            >
              <Typography className={classes.rowText}>
                Record-keeping of validated contributions on
                <br />
                <span style={{ fontWeight: '700' }}>
                  self-owned identity tokens
                </span>
              </Typography>
            </Box>
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              sx={{ height: '100%', width: '60%', background: '#F5F5F5;' }}
            >
              <img src={img1} />
            </Box>
          </Box>

          <Footer theme='light' />
        </Box>
      </>
    )
  } else {
    return (
      <>
        <Box className={classes.DAOsuccess}>
          <Container
            style={{ position: 'absolute', top: 0 }}
            maxWidth='xl'
          >
            <Box
              sx={{ mt: 3 }}
              display='flex'
              flexDirection='row'
              alignItems='center'
              style={{ float: 'left' }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  style={{
                    width: '200px',
                    marginRight: '60px',
                    marginBottom: '5px',
                    marginLeft: '16px',
                  }}
                  src={logo}
                  alt='logo'
                />
                <Link
                  rel='noopener noreferrer'
                  target='_blank'
                  href='https://www.notion.so/lomads/Lomads-Key-Features-Roadmap-0f0fbc49d063436f95c97f26c57479d8'
                  sx={{ mx: 2 }}
                  color='primary'
                  style={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  FEATURES
                </Link>
                <Link
                  rel='noopener noreferrer'
                  target='_blank'
                  href='https://www.lomads.xyz/blog'
                  sx={{ ml: 2, mr: 3 }}
                  color='primary'
                  style={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  BLOG
                </Link>
                <Link
                  rel='noopener noreferrer'
                  target='_blank'
                  href='https://lomads-1.gitbook.io/lomads/'
                  sx={{ ml: 2, mr: 3 }}
                  color='primary'
                  style={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  DOCS
                </Link>
                <Link
                  rel='noopener noreferrer'
                  target='_blank'
                  href='https://lomads.notion.site/Join-Lomads-as-a-Contributor-9678cce3e06744568cf722a09891a5cd'
                  sx={{ ml: 2, mr: 3 }}
                  color='primary'
                  style={{
                    textDecoration: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  CONTRIBUTE
                </Link>
              </div>
            </Box>
          </Container>

          <Box sx={{ marginTop: '100px', marginBottom: '20px' }}>
            <Typography className={classes.italicHeader}>
              Let's Get Started!
            </Typography>

            <Typography
              className={classes.subTitle}
              sx={{ mt: 4 }}
            >
              Thanks for registering on Lomads platform.{' '}
            </Typography>
            <Typography className={classes.subTitle}>
              You are now all set to create your organisation.
            </Typography>
            <Container></Container>
            <Box
              display='flex'
              flexDirection='row'
              justifyContent='center'
            >
              <Button
                variant='contained'
                sx={{ marginTop: '41px' }}
                onClick={() => navigate(`/organisation/create`)}
              >
                CREATE
              </Button>
            </Box>
          </Box>
          <Box
            sx={{ margin: '58px 0' }}
            display='flex'
            flexDirection='row'
            justifyContent='center'
          >
            <Typography
              sx={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#B12F15',
                lineHeight: '40px',
                marginBottom: '58px',
              }}
            >
              See what's inside
            </Typography>
          </Box>

          <Box
            className={classes.row}
            display={'flex'}
            alignItems={'center'}
          >
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              sx={{ height: '100%', width: '60%', background: '#FDF7F5' }}
            >
              <img src={img4} />
            </Box>
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              flexDirection={'column'}
              sx={{ width: '40%' }}
            >
              <Typography
                className={classes.rowText}
                sx={{ marginBottom: '25px' }}
              >
                Streamlined{' '}
                <span style={{ fontWeight: '700' }}>
                  multi-treasury transaction
                </span>
                <br />
                management
              </Typography>
              <Typography className={classes.rowText}>
                Hassle-free{' '}
                <span style={{ fontWeight: '700' }}>financial reporting</span>{' '}
                with
                <br />
                <span style={{ fontWeight: '700' }}>automated labeling</span>
              </Typography>
            </Box>
          </Box>

          <Box
            className={classes.row}
            display={'flex'}
            alignItems={'center'}
          >
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              flexDirection={'column'}
              sx={{ width: '40%' }}
            >
              <Typography className={classes.rowText}>
                Versatile{' '}
                <span style={{ fontWeight: '700' }}>
                  token based memberships
                </span>
                <br />
                sell, whitelist, and beyond
              </Typography>
            </Box>
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              sx={{ height: '100%', width: '60%', background: '#FDF7F5' }}
            >
              <img
                src={img3}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </Box>
          </Box>

          <Box
            className={classes.row}
            sx={{ height: '192px' }}
            display={'flex'}
            alignItems={'center'}
          >
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              sx={{ height: '100%', width: '60%', background: '#F5F5F5;' }}
            >
              <img src={img2} />
            </Box>
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              flexDirection={'column'}
              sx={{ width: '40%' }}
            >
              <Typography className={classes.rowText}>
                <span style={{ fontWeight: '700' }}>
                  Effortless integrations
                </span>
                <br />
                and <span style={{ fontWeight: '700' }}>
                  auto-permissions
                </span>{' '}
                with Notion, Discord,
                <br />
                Github via membership tokens
              </Typography>
            </Box>
          </Box>

          <Box
            className={classes.row}
            display={'flex'}
            alignItems={'center'}
          >
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              flexDirection={'column'}
              sx={{ width: '40%' }}
            >
              <Typography className={classes.rowText}>
                Record-keeping of validated contributions on
                <br />
                <span style={{ fontWeight: '700' }}>
                  self-owned identity tokens
                </span>
              </Typography>
            </Box>
            <Box
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              sx={{ height: '100%', width: '60%', background: '#F5F5F5;' }}
            >
              <img src={img1} />
            </Box>
          </Box>

          <Footer theme='light' />
        </Box>
      </>
    )
  }
}

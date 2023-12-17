import React, { useEffect, useRef, useState, useCallback } from 'react'
import _ from 'lodash'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import coin from 'assets/svg/coin.svg'
import axiosHttp from 'api'
import { ethers } from 'ethers'
import TextInput from 'components/TextInput'
import Button from 'components/Button'
import {
  Box,
  Typography,
  Container,
  Grid,
  IconButton,
  Skeleton,
} from '@mui/material'
import MuiSelect from 'components/Select'
import axios from 'axios'
import { GNOSIS_SAFE_BASE_URLS } from 'constants/chains'
import { SUPPORTED_CHAIN_IDS, SupportedChainId } from 'constants/chains'
import { makeStyles } from '@mui/styles'
import { CHAIN_INFO } from 'constants/chainInfo'
import safeUserIcon from 'assets/svg/safeUserIcon.svg'
import downArrow from 'assets/svg/downArrow.svg'
import { beautifyHexToken } from 'utils'
import Avatar from 'boring-avatars'
import { useAppDispatch } from 'helpers/useAppDispatch'
import { useAppSelector } from 'helpers/useAppSelector'
import { useWeb3Auth } from 'context/web3Auth'
import { isAddressValid } from 'utils'
import { useDAO } from 'context/dao'

const useStyles = makeStyles((theme: any) => ({
  root: {
    maxHeight: 'fit-content',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden !important',
  },
  text: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 15,
    letterSpacing: '-0.011em',
    color: '#76808D',
  },
  inputFieldTitle: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: '-0.011em',
    color: '#1B2B41',
    opacity: 0.5,
  },
  List: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    background: '#FFFFFF',
    borderRadius: 5,
    maxHeight: 'fit-content',
    margin: 8,
  },
  ListItemParent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#FFFFFF',
    borderRadius: 5,
    width: 360,
    padding: 10,
    height: 64,
    gap: 5,
    cursor: 'pointer',
  },
  ListItemContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 5,
    cursor: 'pointer',
  },
  ListContent: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    background: '#FFFFFF',
  },
  StartSafe: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'fit-content',
    padding: '14vh 0vh 10vh 0vh',
  },
  centerFlexContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'fit-content',
  },
  owner: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '2vh 0vh 2vh 0vh',
  },
  centerText: {
    fontSize: 20,
    fontWeight: 400,
    color: '#C94B32',
    padding: 16,
  },
  buttonArea: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 35,
  },
  headerText: {
    fontFamily: 'Insignia',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: '35px',
    lineHeight: '35px',
    paddingBottom: '30px',
    textAlign: 'center',
    color: '#C94B32',
  },
  safeFooter: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 15,
    letterSpacing: '-0.011em',
    color: '#76808D',
    width: 480,
    textAlign: 'center',
    marginBottom: 9,
  },
  inputArea: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  // safeData: {
  // 	display: 'flex',
  // 	flexDirection: 'column',
  // 	alignItems: 'flex-start',
  // 	justifyContent: 'space-between',
  // 	background: '#FFFFFF',
  // 	border: '1px solid #f1f4f4',
  // 	borderRadius: 5,
  // 	maxHeight: 'fit-content',
  // 	width: 385,
  // 	padding: 20,
  // 	marginTop: 2
  // },
  centerCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyItems: 'flex-start',
    background: '#FFFFFF',
    boxShadow:
      '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1)',
    borderRadius: 5,
    maxHeight: 'fit-content',
    padding: 20,
    margin: 35,
    width: 541,
  },
  safeName: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: 600,
    fontSize: 16,
    textAlign: 'left',
    color: '#76808D',
  },
  safeOwners: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    background: '#FFFFFF',
    border: '1px solid #f1f4f4',
    borderRadius: 5,
    maxHeight: 'fit-content',
    padding: 20,
    marginTop: 2,
    width: 360,
    textAlign: 'left',
  },
  ownerList: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  address: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: 16,
    textAlign: 'right',
    color: '#76808D',
  },
  balance: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: 400,
    fontSize: 14,
    lineHeight: 15,
    letterSpacing: '-0.011em',
    color: '#76808D',
    width: 480,
    textAlign: 'center',
    marginTop: '25px',
    marginBottom: '25px',
  },
  safeBalance: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 16,
    marginLeft: 8,
    textAlign: 'center',
    color: '#188C7C',
  },
  tokenAssets: {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
  },
  asset: {
    height: '5vh',
    width: '5vh',
    backgroundColor: '#F5F5F5',
    borderRadius: '50%',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amount: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: '400',
    fontSize: 16,
    textAlign: 'center',
    color: '#76808D',
    marginLeft: '1vh',
  },
  ownerCount: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: '800',
    fontSize: 18,
    textAlign: 'center',
    color: '#76808D',
    marginLeft: '1vh',
  },
  safeOwner: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    width: 325,
  },
  userDetail: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    background: '#FFFFFF',
    gap: 5,
  },
  bottomLine: {
    margin: 20,
    width: 210,
    height: 2,
    backgroundColor: '#C94B32',
    border: '2px solid #C94B32',
    position: 'relative',
    borderRadius: 50,
  },
  ChainLogo: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EEE',
    borderRadius: '50%',
    width: 32,
    height: 32,
    margin: 10,
  },
  safeContainer: {
    marginBottom: 30,
    display: 'flex',
    flexDirection: 'column',
    // height: 550,
    // overflowY: "scroll"
  },
  addSafe: {
    bottom: 13,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
}))

export default () => {
  const classes = useStyles()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { daoURL } = useParams()
  const { DAO } = useDAO()
  const [errors, setErrors] = useState<any>({})
  const [isLoading, setisLoading] = useState<boolean>(false)
  const [safeLoading, setSafeLoading] = useState<boolean>(false)
  const [safeList, setSafeList] = useState<any>([])
  const [safe, setSafe] = useState<any>(null)
  const [safeListLoading, setSafeListLoading] = useState<boolean>(false)
  const { provider, account, chainId } = useWeb3Auth()
  const [selectedSafeAddress, setSelectedSafeAddress] = useState<string | null>(
    null
  )
  const [state, setState] = useState<any>({})
  const [noSafeError, setNoSafeError] = useState<any>(null)

  const loadSafe = useCallback(
    async (safeAddress: string) => {
      try {
        setSafeLoading(true)
        let currSafe: any = {
          address: null,
          owners: [],
          tokens: [],
          threshold: 0,
        }
        const s: string[] = await axios
          .get(
            `${
              GNOSIS_SAFE_BASE_URLS[state?.selectedChainId]
            }/api/v1/safes/${safeAddress}`
          )
          .then((res) => res?.data)
        const safeowners: string[] = _.get(s, 'owners', [])
        const tokens = await axios
          .get(
            `${
              GNOSIS_SAFE_BASE_URLS[state?.selectedChainId]
            }/api/v1/safes/${safeAddress}/balances/usd/`
          )
          .then((res) => res?.data)

        for (let index = 0; index < safeowners.length; index++) {
          const owner = safeowners[index]
          if (
            !_.find(
              currSafe.owners,
              (w: any) => w.address.toLowerCase() === owner.toLowerCase()
            )
          )
            currSafe.owners.push({ name: '', address: owner })
        }

        currSafe.tokens = tokens
        currSafe.threshold = _.get(s, 'threshold', 0)
        console.log('safeowners', { ...currSafe, address: safeAddress })
        setSafe({ ...currSafe, address: safeAddress })
        setSafeLoading(false)
      } catch (e) {
        setSafeLoading(false)
      }
    },
    [state?.selectedChainId]
  )

  useEffect(() => {
    if (selectedSafeAddress) {
      loadSafe(selectedSafeAddress)
    } else {
      setSafe(null)
    }
  }, [selectedSafeAddress])

  const loadSafes = useCallback(() => {
    if (state?.selectedChainId) {
      setSafeListLoading(true)
      console.log(account, '------')
      axios
        .get(
          `${
            GNOSIS_SAFE_BASE_URLS[state?.selectedChainId]
          }/api/v1/owners/${account}/safes/`
        )
        .then((res) => {
          const safeList = res.data.safes.filter(
            (safe: any) => !_.find(DAO?.safes, (s: any) => s.address === safe)
          )
          if (!safeList || safeList?.length === 0) {
            setNoSafeError(true)
            setTimeout(() => setNoSafeError(null), 2000)
          } else {
            setSafeList(safeList)
          }
        })
        .finally(() => setSafeListLoading(false))
    }
  }, [state?.selectedChainId])

  const handleAddSafe = useCallback(() => {
    setisLoading(true)
    console.log(safe?.owners)
    const totalAddresses = safe?.owners
    const value = totalAddresses.reduce((final: any, current: any) => {
      let object = final.find((item: any) => item.address === current.address)
      if (object) {
        return final
      }
      return final.concat([current])
    }, [])
    const params = {
      members: value.map((m: any) => {
        return {
          ...m,
          creator: m.address.toLowerCase() === account?.toLowerCase(),
          role:
            safe?.owners
              .map((a: any) => a?.address?.toLowerCase())
              .indexOf(m.address.toLowerCase()) > -1
              ? 'role1'
              : m.role
              ? m.role
              : 'role4',
        }
      }),
      safe: {
        name: state?.safeName,
        address: selectedSafeAddress,
        threshold: safe?.threshold,
        owners: totalAddresses.map((a: any) => a.address),
        chainId: state?.selectedChainId,
        token: {
          tokenAddress: process.env.REACT_APP_NATIVE_TOKEN_ADDRESS,
          symbol: CHAIN_INFO[state?.selectedChainId]?.nativeCurrency?.symbol,
        },
      },
    }
    console.log(safe)
    axiosHttp
      .post(`dao/${daoURL}/attach-safe`, params)
      .then((res) => {
        setisLoading(false)
        if (location?.state?.createFlow)
          window.location.href = `/${daoURL}/membership/create`
        else window.location.href = `/${daoURL}/settings`
      })
      .finally(() => setisLoading(false))
  }, [state, safe])

  const handleClick = useCallback(() => {
    console.log('clicked')
    if (!selectedSafeAddress || !safe) return
    let terrors: any = {}
    if (!isAddressValid(selectedSafeAddress)) {
      terrors.issafeAddress = ' * Safe Address is not valid.'
    }
    if (_.isEmpty(terrors)) {
      handleAddSafe()
    } else {
      setErrors(terrors)
    }
  }, [selectedSafeAddress, safe])

  const handleClickDelayed = useCallback(_.debounce(handleClick, 1000), [
    handleClick,
    safe,
    selectedSafeAddress,
  ])

  const SafeDetails = ({ index }: any) => {
    if (!safe) {
      return (
        <Box
          className={classes.centerFlexContainer}
          key={index}
        >
          <Skeleton
            variant='rectangular'
            sx={{ mb: 0.5 }}
            height={60}
            width={360}
          />
          <Skeleton
            variant='rectangular'
            height={120}
            width={360}
          />
        </Box>
      )
    }
    return (
      <Box
        className={classes.centerFlexContainer}
        key={index}
      >
        <Box className={classes.safeOwners}>
          <Box className={classes.balance}>
            <img
              src={coin}
              alt='coin'
            />
            <Box className={classes.safeBalance}>
              $ {safe?.tokens?.length >= 1 && safe?.tokens[0].fiatBalance}
            </Box>
          </Box>
          <Box className={classes.tokenAssets}></Box>
        </Box>
        <Box className={classes.safeOwners}>
          <Box className={classes.ownerCount}>
            {safe?.owners?.length} Owners :
          </Box>
          <Box className={classes.ownerList}>
            {safe?.owners?.map((result: any, index: number) => {
              return (
                <>
                  <Box
                    className={classes.safeOwner}
                    key={index}
                  >
                    <Box className={classes.userDetail}>
                      <Box sx={{ marginTop: 1.2 }}>
                        <Avatar
                          size={32}
                          name={result.address}
                          variant='bauhaus'
                          colors={[
                            '#E67C40',
                            '#EDCD27',
                            '#8ECC3E',
                            '#2AB87C',
                            '#188C8C',
                          ]}
                        />
                        {/* <img src={safeUserIcon} alt="safe-owner-icon" /> */}
                      </Box>
                      <TextInput
                        placeholder='Name'
                        type='text'
                        inputProps={{ maxLength: 50 }}
                        sx={{
                          marginTop: 1,
                          width: 141,
                          '& .MuiInputBase-input': {
                            height: 30,
                            padding: '2px',
                          },
                        }}
                        onChange={(e: any) => {
                          setState((prev: any) => {
                            return {
                              ...prev,
                              owners: safe?.owners.map((o: any, _i: number) => {
                                if (_i === index) {
                                  return { name: e.target.value, ...o }
                                }
                                return o
                              }),
                            }
                          })
                        }}
                      />
                    </Box>
                    <Box className={classes.address}>
                      {result.address.slice(0, 6) +
                        '...' +
                        result.address.slice(-4)}
                    </Box>
                  </Box>
                </>
              )
            })}
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Container>
      <Grid className={classes.root}>
        <Box className={classes.StartSafe}>
          <Box className={classes.headerText}>
            {!location?.state?.createFlow ? '' : '2/3'} Organisation's Safe
            Multi-sig Wallet
          </Box>
          <Box className={classes.buttonArea}>
            <Box>
              <Button
                style={{
                  backgroundColor: '#FFFFFF',
                  minWidth: 'max-content',
                  fontWeight: 400,
                  opacity: 0.6,
                  width: 228,
                  color: 'rgba(201, 75, 50, 0.6)',
                }}
                onClick={() => {
                  navigate(
                    `/${daoURL}/attach-safe/new`,
                    location?.state?.createFlow
                      ? { state: { createFlow: true } }
                      : {}
                  )
                }}
                variant='contained'
              >
                CREATE
              </Button>
            </Box>
            <Box className={classes.centerText}>or</Box>
            <Box>
              <Button
                style={{
                  color: '#C94B32',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 400,
                  minWidth: 'max-content',
                  width: 228,
                  boxShadow:
                    '3px 5px 20px rgba(27, 43, 65, 0.12), 0px 0px 20px rgba(201, 75, 50, 0.18)',
                }}
                variant='contained'
              >
                ADD EXISTING
              </Button>
            </Box>
          </Box>
          <Box className={classes.bottomLine} />
          <Box className={classes.centerCard}>
            <Box className={classes.inputFieldTitle}>Select Chain</Box>
            <MuiSelect
              selected={state?.selectedChainId}
              options={SUPPORTED_CHAIN_IDS.map((item) => ({
                label: CHAIN_INFO[item].label,
                value: item,
              }))}
              selectStyle={{ py: 1 }}
              setSelectedValue={(value) => {
                setState((prev: any) => {
                  return { ...prev, selectedChainId: value }
                })
                setSafeList([])
              }}
            />
          </Box>
          {safeList.length > 0 ? (
            <Box className={classes.centerFlexContainer}>
              <Box className={classes.bottomLine} />
              <Box className={classes.safeContainer}>
                {safeList.map((item: any, index: any) => (
                  <Box
                    key={index}
                    className={classes.List}
                  >
                    <Box
                      className={classes.ListItemParent}
                      onClick={() => {
                        setSelectedSafeAddress((prev: any) => {
                          if (prev && prev === item) return null
                          return item
                        })
                        setSafe(null)
                      }}
                      sx={{
                        border:
                          selectedSafeAddress == item
                            ? '1px solid #C94B32'
                            : '',
                      }}
                    >
                      <Box className={classes.ListItemContent}>
                        <Box className={classes.ChainLogo}>
                          <img
                            width={18}
                            height={18}
                            src={CHAIN_INFO[state?.selectedChainId].logoUrl}
                            alt='seek-logo'
                          />
                        </Box>
                        <Box>
                          <Typography className={classes.safeName}>
                            Multi-sig Wallet
                          </Typography>
                          <Typography>{beautifyHexToken(item)}</Typography>
                        </Box>
                      </Box>
                      <IconButton>
                        <img
                          src={downArrow}
                          alt='down-arrow'
                        />
                      </IconButton>
                    </Box>
                    {selectedSafeAddress === item ? (
                      <SafeDetails index={index} />
                    ) : (
                      ''
                    )}
                  </Box>
                ))}
              </Box>
              <Box
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  className={classes.inputFieldTitle}
                  style={{ marginBottom: 8 }}
                >
                  Reminder:
                </Box>
                <Typography
                  className={classes.inputFieldTitle}
                  style={{ marginBottom: 8 }}
                >
                  All signers will have admin rights on the dashboard.
                </Typography>
                <Typography
                  className={classes.inputFieldTitle}
                  style={{ marginBottom: 20 }}
                >
                  You can add/remove signers and Safe Multi-sig from Settings
                </Typography>
              </Box>
              <Box className={classes.addSafe}>
                <Button
                  disabled={isLoading || !selectedSafeAddress || !safe}
                  loading={isLoading}
                  onClick={handleClickDelayed}
                  variant='contained'
                >
                  ADD
                </Button>
              </Box>
            </Box>
          ) : (
            <Box
              style={{
                margin: 25,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Button
                disabled={!state.selectedChainId}
                loading={safeListLoading}
                onClick={loadSafes}
                variant='contained'
              >
                FIND MY SAFE
              </Button>
              <Typography
                color='error'
                style={{ margin: '12px 0' }}
              >
                {state?.selectedChainId &&
                  noSafeError &&
                  `You have no safe on ${
                    CHAIN_INFO[state?.selectedChainId]?.chainName
                  }`}
              </Typography>
            </Box>
          )}
        </Box>
      </Grid>
    </Container>
  )
}

import React, { useEffect, useState, useRef, useCallback } from "react";
import { get as _get, find as _find, isEmpty as _isEmpty, debounce as _debounce } from 'lodash'
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Select from 'components/Select'
import _ from "lodash";
import TextInput from 'components/TextInput'
import IconButton from "components/IconButton";
import Button from "components/Button";
import plusIcon from 'assets/svg/plusIcon.svg';
import closeOrange from 'assets/svg/closeOrange.svg';
import GreyAddIcon from 'assets/svg/ADD.svg';
import safeIcon from 'assets/images/GnosisSafe.png';
import useENS from "hooks/useENS";
import { useAppSelector } from "helpers/useAppSelector";
import { useAppDispatch } from "helpers/useAppDispatch";
import { toast } from 'react-hot-toast';
import axiosHttp from 'api'
import { SUPPORTED_CHAIN_IDS, SupportedChainId, CHAIN_GAS_STATION, GNOSIS_SAFE_BASE_URLS } from 'constants/chains'
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import { SafeFactory, SafeAccountConfig } from "@gnosis.pm/safe-core-sdk";
import { ethers } from "ethers";
import { CHAIN_INFO } from 'constants/chainInfo';
import { Box, Typography, Container, Grid, Menu, MenuItem, Skeleton, Chip } from "@mui/material"
import { makeStyles } from '@mui/styles';
import axios from "axios";
import Avatar from "components/Avatar";
import { useWeb3Auth } from "context/web3Auth";
import { isAddressValid, isRightAddress } from 'utils'
import SwitchChain from "components/SwitchChain";
import { useDAO } from "context/dao";
import { ContractNetworksConfig } from '@safe-global/protocol-kit'
import Overlay from "components/Overlay"
import palette from 'theme/palette';

const useStyles = makeStyles((theme: any) => ({
	root: {
		maxHeight: 'fit-content',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		overflow: 'hidden !important'
	},
	text: {
		fontFamily: 'Inter, sans-serif',
		fontStyle: 'italic',
		fontWeight: 400,
		fontSize: 14,
		letterSpacing: '-0.011em',
		color: '#76808D'
	},
	inputFieldTitle: {
		fontFamily: 'Inter, sans-serif',
		fontStyle: 'normal',
		fontWeight: 700,
		fontSize: 16,
		letterSpacing: '-0.011em',
		color: '#1B2B41',
		opacity: 0.5
	},
	safeNameTitle: {
		fontFamily: 'Inter, sans-serif',
		fontStyle: 'normal',
		fontWeight: 700,
		fontSize: 16,
		letterSpacing: '-0.011em',
		color: '#1B2B41',
		opacity: 0.5,
		marginBottom: 6.71,
		marginTop: 15
	},
	centerCard: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		justifyItems: 'flex-start',
		background: '#FFFFFF',
		boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1)',
		borderRadius: 5,
		maxHeight: 'fit-content',
		padding: 20,
		margin: 35,
		width: 541
	},
	centerCardSkeleton: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		justifyItems: 'flex-start',
		background: '#FFFFFF',
		borderRadius: 5,
		maxHeight: 'fit-content',
		padding: 20,
		margin: 35,
		width: 385
	},
	thresholdText: {
		fontFamily: 'Inter, sans-serif',
		fontStyle: 'normal',
		fontWeight: 400,
		fontSize: 16,
		letterSpacing: '-0.011em',
		color: '#76808D',
	},
	StartSafe: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		height: 'fit-content',
		padding: '14vh 0vh 10vh 0vh'
	},
	addOwner: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		justifyItems: 'flex-start',
		background: '#FFFFFF',
		boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1)',
		borderRadius: 5,
		maxHeight: 'fit-content',
		width: 551,
		padding: 20,
		marginTop: 35,
		marginBottom: 35
	},
	owner: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		margin: '2vh 0vh 2vh 0vh'
	},
	avatarName: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '30%'
	},
	nameText: {
		fontFamily: 'Inter, sans-serif',
		fontStyle: 'normal',
		fontWeight: 400,
		fontSize: 14,
		letterSpacing: '-0.011em',
		color: '#76808D',
		paddingLeft: 26,
		textAlign: 'center',
	},
	cardButton: {
		marginTop: 25,
		width: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	centerText: {
		fontSize: 20,
		fontWeight: 400,
		color: '#C94B32',
		padding: 16
	},
	buttonArea: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingBottom: 35
	},
	selectionArea: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'center',
		textAlign: 'center'
	},
	thresholdCount: {
		fontFamily: 'Inter, sans-serif',
		fontStyle: 'normal',
		fontWeight: 400,
		fontSize: 16,
		letterSpacing: '-0.011em',
		color: '#76808D',
	},
	headerText: {
		fontFamily: 'Insignia',
		fontStyle: 'normal',
		fontWeight: '400',
		fontSize: '35px',
		lineHeight: '35px',
		paddingBottom: '30px',
		textAlign: 'center',
		color: '#C94B32'
	},
	boldText: {
		fontWeight: 800
	},
	safeFooter: {
		fontFamily: 'Inter, sans-serif',
		fontStyle: 'italic',
		fontWeight: 400,
		fontSize: 14,
		letterSpacing: '-0.011em',
		color: '#76808D',
		width: 480,
		textAlign: 'center',
		paddingBottom: 9,
		marginBottom: 35
	},
	bottomLine: {
		margin: 20,
		width: 210,
		height: 2,
		backgroundColor: '#C94B32',
		border: '2px solid #C94B32',
		position: 'relative',
		borderRadius: 50
	},
	InviteGang: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'relative',
		margin: '35px 0px 15px 0px'
	},
	centerInputCard: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'flex-start',
		justifyItems: 'flex-start',
		background: '#FFFFFF',
		boxShadow: '3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1)',
		borderRadius: '5px',
		maxHeight: 'fit-content',
		padding: '26px 22px 30px 22px',
		width: 541,
		gap: '10px'
	},
	inputTitle: {
		fontFamily: 'Inter, sans-serif',
		fontStyle: 'normal',
		fontWeight: 700,
		fontSize: 16,
		letterSpacing: '-0.011em',
		color: '#76808D',
		margin: '0vh 0px 0vh 1vh'
	},
	inputArea: {
		display: 'flex',
		alignItems: 'center',
		width: '100%'
	},
	inputField: {
		width: '500px',
		height: '90px',
		textAlign: 'justify',
		paddingLeft: '10px',
		background: '#f5f5f5',
		boxShadow: 'inset 1px 0px 4px rgba(27, 43, 65, 0.1)',
		borderRadius: '10px',
		borderWidth: '0px',
		fontFamily: 'Inter, sans-serif',
		fontStyle: 'normal',
		fontWeight: '400',
		fontSize: '16px',
		lineHeight: '18px',
		color: '#76808D'
	},
	membersModalFooter: {
		width: '768px',
		height: '100px',
		position: 'fixed',
		bottom: '0',
		right: '0',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	membersModalFooterCancelBtn: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '5px',
		height: '40px',
		background: '#FFFFFF',
		border: '1px solid #C94B32',
		color: '#C94B32',
		width: '130px',
		marginRight: '20px',
	},
	invitedMembers: {
		padding: '26px 22px',
		backgroundColor: 'rgba(118, 128, 141, 0.09)',
		boxShadow: 'inset 1px 0px 4px rgba(27, 43, 65, 0.1)',
		borderRadius: '0px 0px 5px 5px',
		width: 497,
		maxHeight: 500,
		overflow: 'hidden',
		overflowY: 'auto'
	},
	avatarPlusName: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '30%',
	},
	avatarAddress: {
		display: 'flex',
		justifyContent: 'flex-start',
		alignItems: 'center',
		width: '25%',
	},
	avatarRole: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: '35%',
	},
	tokenDropdown: {
		background: 'linear-gradient(180deg, #FBF4F2 0%, #EEF1F5 100%)',
		borderRadius: '10px',
		width: '13vw',
		height: '50px',
		fontFamily: 'Inter, sans-serif',
		fontStyle: 'normal',
		fontWeight: '400',
		fontSize: '16px',
		lineHeight: '18px',
		letterSpacing: '-0.011em',
		color: '#76808D',
		padding: '0px 15px 0px 15px',
		marginTop: '10px',
		marginRight: '25px',
	},
	membersModal: {
		width: 768,
		height: 768,
		backgroundColor: 'white',
		position: 'absolute',
		top: '50%',
		right: '50%',
		transform: 'translate(50%, -50%)',
		borderRadius: 20,
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: '65px 65px 0 65px',
		zIndex: 999
	},
	membersModalHeader: {
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		marginBottom: '20px'
	},
	membersModalBody: {
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'column',
		overflowY: 'scroll',
		marginBottom: '100px',
	},
	membersModalRow: {
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginBottom: 20,
		position: 'relative',
	},
	rowOvercast: {
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(255, 255, 255, 0.5)',
		position: 'absolute',
		zIndex: 998
	},
	addButton: {
		padding: '0px 10px 0px 10px',
		borderRadius: '5px',
		borderWidth: '0px',
		borderColor: '#FFFFFF',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		color: '#FFFFFF'
	},
	avatarBtn: {
		display: 'flex',
		justifyContent: 'flex-end',
		alignItems: 'center',
		width: '10%',
	},
	deleteButton: {
		backgroundColor: '#76808D',
		padding: '5px',
		borderRadius: '5px',
		color: '#FFFFFF',
		cursor: 'pointer',
	},
	confirmBtn: {
		background: '#C94B32',
		color: '#FFF',
		width: '210px',
	},
	selected: {
		background: '#B12F15'
	},
	infoText: {
		fontFamily: 'Inter, sans-serif',
		fontStyle: 'italic',
		fontWeight: '400',
		fontSize: '16px',
		lineHeight: '25px',
		textAlign: 'center',
		letterSpacing: '-0.011em',
		color: '#76808D',
		textDecoration: 'underline',
		cursor: 'pointer',
	}
}));

export default () => {
	const classes = useStyles()
	const location = useLocation();
	//@ts-ignore
	const { user } = useAppSelector(store => store.session)
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const { daoURL } = useParams()
	const { DAO } = useDAO();
	const { getENSAddress, getENSName } = useENS();
	const { provider, account, chainId } = useWeb3Auth();
	const [polygonGasEstimate, setPolygonGasEstimate] = useState<any>();
	const [errors, setErrors] = useState<any>({})
	const [memberPlaceholder, setMemberPlaceholder] = useState<any>({})
	const [validSafeDetails, setValidSafeDetails] = useState<boolean>(false);
	const [state, setState] = useState<any>({})
	const [isLoading, setisLoading] = useState<boolean>(false)
	const contractNetworks: ContractNetworksConfig = {
		[8453]: {
		  safeMasterCopyAddress: '0x69f4D1788e39c87893C980c06EdF4b7f686e2938',
		  safeProxyFactoryAddress: '0xC22834581EbC8527d974F8a1c97E1bEA4EF910BC',
		  multiSendAddress: '0x998739BFdAAdde7C933B942a68053933098f9EDa',
		  multiSendCallOnlyAddress: '0xA1dabEF33b3B82c7814B6D82A79e50F4AC44102B',
		  fallbackHandlerAddress: '0x017062a1dE2FE6b99BE3d9d37841FeD19F573804',
		  signMessageLibAddress: '0x98FFBBF51bb33A056B08ddf711f289936AafF717',
		  createCallAddress: '0xB19D6FFc2182150F8Eb585b79D4ABcd7C5640A9d',
		}
	  }

	const [isOpen, setIsOpen] = useState(false); 
	const toggleOverlay = () => {
		setIsOpen(!isOpen);
	  };

	useEffect(() => {
		setState((prev: any) => {
			return {
				...prev,
				members: [{ name: user?.name || '', address: user?.wallet || account }],
				threshold: 1
			}
		})
	}, [])

	useEffect(() => {
		if (state?.selectedChainId && +state?.selectedChainId === SupportedChainId.POLYGON) {
			axios.get(CHAIN_GAS_STATION[`${state?.selectedChainId}`].url)
				.then(res => setPolygonGasEstimate(res.data))
		}
	}, [state?.selectedChainId])

	const handleValidSafeDetails = () => {
		let terrors: any = {};
		// if (!state.safeName || state.safeName === '') {
		// 	terrors.safeName = " * Multi-sig Wallet Name is required";
		// }
		if (_.isEmpty(terrors)) {
			setValidSafeDetails(true)
		} else {
			setErrors(terrors);
		}
	}

	const addMember = (_ownerName: string, _ownerAddress: string, _ownerRole: string) => {
		return new Promise(async (resolve, reject) => {
			let member = { name: _ownerName, address: _ownerAddress, role: _ownerRole };
			if (_ownerAddress.slice(-4) === ".eth") {
				const EnsAddress = await getENSAddress(_ownerAddress);
				console.log("74 ensAddress : ", EnsAddress);
				if (EnsAddress !== undefined) {
					member.address = EnsAddress as string;
					member.name = _ownerName !== '' ? _ownerName : _ownerAddress;
				}
				else {
					setErrors({ ownerAddress: " * address is not correct." });
					member.address = _ownerAddress;
				}
			}
			else {
				let ENSname = null;
				ENSname = await getENSName(_ownerAddress)
				if (ENSname) {
					member.name = _ownerName !== '' ? _ownerName : ENSname;
				}
				else {
					member.name = _ownerName;
				}
			}
			if (isRightAddress(member.address)) {
				const newMembers = [...state?.members, member];
				if (_find(state?.members, (m: any) => m.address === member.address)) {
					setErrors({ ownerAddress: " * address already exists." });
				} else {
					setState((prev: any) => { return { ...prev, members: newMembers } })
					setMemberPlaceholder({ name: '', address: '' })
				}
			}
			resolve(true);
		})
	};

	const handleAddNewMember = ({ address, name }: any) => {
		setErrors({})
		let terrors: any = {};
		if (!isAddressValid(address)) {
			terrors.ownerAddress = " * address is not correct.";
		}
		if (_find(state?.members, (member: any) => member.address === address)) {
			terrors.ownerAddress = " * address already exists.";
		}
		if (_isEmpty(terrors)) {
			addMember(name, address, 'role1')
		}
		else {
			setErrors(terrors);
		}
	}


	const waitFor = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

	const retry = (promise: any, onRetry: any, maxRetries: number) => {
		const retryWithBackoff: any = async (retries: number) => {
			try {
				if (retries > 0) {
					const timeToWait = 2 ** retries * 1000;
					console.log(`waiting for ${timeToWait}ms...`);
					await waitFor(timeToWait);
				}
				return await promise();
			} catch (e) {
				if (retries < maxRetries) {
					onRetry();
					return retryWithBackoff(retries + 1);
				} else {
					console.warn("Max retries reached. Bubbling the error up");
					throw e;
				}
			}
		}
		return retryWithBackoff(0);
	}

	const hasNewSafe = async (currentSafes: any) => {
		try {
			const latestSafes = await axios.get(`${GNOSIS_SAFE_BASE_URLS[state?.selectedChainId]}/api/v1/owners/${account}/safes/`).then(res => res.data.safes);
			if (latestSafes.length > currentSafes.length)
				return latestSafes
			else
				throw 'SAFE NOT FOUND'
		} catch (e) {
			throw e
		}
	}

	const runAfterCreation = async (addr: string, owners: any) => {
		console.log("runAfterCreation", "safe addr", addr)
		if (!addr) return;
		const value = state?.members?.reduce((final: any, current: any) => {
			let object = final.find(
				(item: any) => item.address === current.address
			);
			if (object) {
				return final;
			}
			return final.concat([current]);
		}, []);
		const params = {
			members: value.map((m: any) => {
				return {
					...m, creator: m.address.toLowerCase() === account?.toLowerCase(), role: 'role1'
				}
			}),
			safe: {
				name: state?.safeName,
				address: addr,
				owners: owners,
				threshold: state?.threshold,
				chainId: state?.selectedChainId,
				token: {
					tokenAddress: process.env.REACT_APP_NATIVE_TOKEN_ADDRESS,
					symbol: CHAIN_INFO[state?.selectedChainId]?.nativeCurrency?.symbol
				}
			}
		}
		axiosHttp.post(`dao/${daoURL}/attach-safe`, params)
			.then(res => {
				if (location?.state?.createFlow)
					window.location.href = `/${daoURL}/membership/create`
				else
					window.location.href = `/${daoURL}/settings`
			})
		setisLoading(false);
	}

	const checkNewSafe = async (currentSafes: any, owners: any) => {
		const latestSafes = await retry(
			() => hasNewSafe(currentSafes),
			() => { console.log('retry called...') },
			50
		)
		if (latestSafes) {
			let newSafeAddr = _.find(latestSafes, ls => currentSafes.indexOf(ls) === -1)
			console.log("FOUND NEW SAFE", newSafeAddr)
			if (newSafeAddr)
				runAfterCreation(newSafeAddr, owners)
			else
				console.log("checkNewSafe", "Could not find new safe")
		} else {
			setisLoading(false);
		}
	}

	const deployNewSafe = async () => {
		if (!chainId) return;

		if (+state?.selectedChainId !== +chainId) {
			toast.custom(t => <SwitchChain t={t} nextChainId={+state?.selectedChainId} />)
		} else {
			
			try {
				setisLoading(true);
				toggleOverlay();
				const safeOwner = provider?.getSigner(0);
				const ethAdapter = new EthersAdapter({
					ethers,
					signerOrProvider: safeOwner as any,
				});

			
				const props = {
						ethAdapter:ethAdapter,
						contractNetworks:contractNetworks
						}
			

		
				const safeFactory = await SafeFactory.create({...props });
				//const safeFactory = await SafeFactory.create({ ethAdapter });


				const owners: any = state?.members?.map((result: any) => result.address);
				const threshold: number = state?.threshold;
				const safeAccountConfig: SafeAccountConfig = { owners, threshold };

				let currentSafes: Array<string> = []
				// if (chainId === SupportedChainId.POLYGON)
				currentSafes = await axios.get(`${GNOSIS_SAFE_BASE_URLS[state?.selectedChainId]}/api/v1/owners/${account}/safes/`).then(res => res.data.safes);
				
				await safeFactory
					.deploySafe({ safeAccountConfig })
					.then(async (tx) => {
						console.log("txn txn", tx)
						checkNewSafe(currentSafes, owners)
						// const value = state?.members?.reduce((final: any, current: any) => {
						// 	let object = final.find(
						// 		(item: any) => item.address === current.address
						// 	);
						// 	if (object) {
						// 		return final;
						// 	}
						// 	return final.concat([current]);
						// }, []);
						// const params = {
						// 	members: value.map((m: any) => {
						// 		return {
						// 			...m, creator: m.address.toLowerCase() === account?.toLowerCase(), role: owners.map((a: any) => a.toLowerCase()).indexOf(m.address.toLowerCase()) > -1 ? 'role1' : m.role ? m.role : 'role4'
						// 		}
						// 	}),
						// 	safe: {
						// 		name: state?.safeName,
						// 		address: tx.getAddress(),
						// 		owners: owners,
						// 		threshold: state?.threshold,
						// 		chainId: state?.selectedChainId,
						// 		token: {
						// 			tokenAddress: process.env.REACT_APP_NATIVE_TOKEN_ADDRESS,
						// 			symbol: CHAIN_INFO[state?.selectedChainId]?.nativeCurrency?.symbol
						// 		}
						// 	}
						// }
						// axiosHttp.post(`dao/${daoURL}/attach-safe`, params)
						// 	.then(res => {
						// 		setisLoading(false);
						// 		if (location?.state?.createFlow)
						// 			window.location.href = `/${daoURL}/welcome`
						// 		else
						// 			window.location.href = `/${daoURL}/settings`
						// 	})
					})
					.catch(async (err) => {
						console.log("An error occured while creating safe", err);
						if (chainId === SupportedChainId.POLYGON) {
							checkNewSafe(currentSafes, owners)
						} else {
							setisLoading(false);
							setIsOpen(false);
						}
					});
			} catch (e) {
				setisLoading(false);
				setIsOpen(false);
				console.log(e)
			}
		}
	};

	const deployNewSafeDelayed = useCallback(_debounce(deployNewSafe, 1000), [deployNewSafe])

	const SelectThreshold = () => {
		return (
			<>
				<Box className={classes.bottomLine} />
				<Box className={classes.centerCard}>
					<Box>
						<Box className={classes.inputFieldTitle} sx={{ my: 1 }}>
						Specify the minimum number of approvals needed for transactions:
						</Box>
					</Box>
					<Box className={classes.selectionArea}>
						<Box style={{ width: 109 }}>
							<Select
								selected={state?.threshold}
								options={state?.members?.map((item: any, index: number) => ({ label: index + 1, value: index + 1 }))}
								setSelectedValue={(value) => {
									setState((prev: any) => { return { ...prev, threshold: +value } })
								}}
							/>
						</Box>
						<Box sx={{ mx: 1 }} className={classes.thresholdCount}>
							of {state?.members?.length} total signer(s)
						</Box>
					</Box>
				</Box>
				<Typography className={classes.safeFooter}>
					By continuing you consent to the <span onClick={() => window.open('https://safe.global/terms', '_blank')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Use</span> and <span onClick={() => window.open('https://safe.global/privacy', '_blank')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span> of Gnosis Safe
				</Typography>
				{/* <Box className={classes.safeFooter}>
					You’re about to create a new safe and will have to confirm a
					transaction with your curently connected wallet.
					<Typography variant="body1" className={classes.boldText}>
						{state?.selectedChainId && +state?.selectedChainId === SupportedChainId.POLYGON && polygonGasEstimate ? `The creation will cost approximately ${polygonGasEstimate?.standard?.maxFee} GWei.` : `The creation will cost approximately 0.01256 GOR.`}
					</Typography>
					The exact amount will be determinated by your wallet.
				</Box> */}
				<Button loading={isLoading} disabled={isLoading} onClick={deployNewSafeDelayed} variant='contained'>CREATE</Button>

				<Overlay isOpen={isOpen} onClose={toggleOverlay}>
				<div style={{ display: 'flex', justifyContent: 'center'}}>
					<img src={safeIcon} height={50} alt="safe-icon" />
				</div>
				
				<div style={{ display: 'flex', justifyContent: 'center'}}>
        			<h1 className={classes.inputTitle}>Waiting for Transaction Confirmation</h1>
				</div>

				<div>
				<Typography className={classes.safeFooter} style={{ fontStyle: 'italic', opacity: 0.8, fontSize: 14, padding: '10px' }}>
					{DAO?.name} treasury is being deployed on { CHAIN_INFO[state.selectedChainId].label }. This might take several minutes. <span style={{ textDecoration: 'underline'}}><b>Please do not refresh the page</b></span>
				</Typography>				
				</div>	
      			</Overlay>


				{ isLoading && <Typography className={classes.safeFooter} style={{ color:'#C94B32',fontStyle: 'italic', opacity: 0.8, fontSize: 14 }}>
				Please confirm the transaction with your connected wallet
					</Typography> }
			</>
		);
	};

	const deleteMember = (_address: any) => {

		let deleteMember = [...state.members];
		deleteMember = deleteMember.filter((item) => item.address !== _address);
		setState((prev: any) => { return { ...prev, members: deleteMember } })
	};

	const InviteMembersBlock = () => {
		return (
			<>
				<Box className={classes.bottomLine} />
				<Box className={classes.InviteGang}>
					<Box className={classes.centerInputCard}>
					<Box className={classes.inputFieldTitle}>Assign additional trusted signers:</Box>
						<Box className={classes.inputArea}>
							<Box style={{ marginRight: '10px' }}>
								<TextInput
									sx={{ height: 50, width: 144 }}
									placeholder="Name"
									inputProps={{ maxLength: 50 }}
									value={memberPlaceholder.name}
									onChange={(e: any) => { setErrors({}); setMemberPlaceholder((prev: any) => { return { ...prev, name: e.target.value } }) }}
								/>
							</Box>
							<Box sx={{ marginRight: '10px' }}>
								<TextInput
									sx={{ height: 50, width: 251 }}
									placeholder="ENS Domain and Wallet Address"
									value={memberPlaceholder.address}
									onChange={(e: any) => { setErrors({}); setMemberPlaceholder((prev: any) => { return { ...prev, address: e.target.value } }) }}
									error={!!errors.ownerAddress}
									helperText={errors.ownerAddress}
								/>
							</Box>
							<Box>
								<IconButton onClick={() => handleAddNewMember(memberPlaceholder)} sx={{ width: 50, height: 50 }}>
									<img src={memberPlaceholder?.name && memberPlaceholder?.address ? plusIcon : GreyAddIcon} alt={"add plus"} />
								</IconButton>
							</Box>

						</Box>
							<Box style={{
								width: '100%',
								display: 'flex',
								flexDirection: 'column',
							}}>
								<Box className={classes.inputFieldTitle} style ={{marginBottom: 8, marginTop: 20}} >Note:</Box>			
								<Typography className={classes.inputFieldTitle} style ={{marginBottom: 8}} >As the creator, you’re automatically a signer.</Typography>
								<Typography className={classes.inputFieldTitle} style ={{marginBottom: 8}}>All signers will have admin rights on the dashboard.</Typography>
								<Typography className={classes.inputFieldTitle} style ={{marginBottom: 8}} >You can add/remove signers and Safe Multi-sig from Settings</Typography>

							</Box>
					</Box>
					{state?.members?.length >= 1 && (
						<>
							<Box className={classes.invitedMembers}>
								{state?.members?.map((result: any, index: any) => {
									return (
										<Box key={index} className={classes.owner}>
											<Box className={classes.avatarPlusName}>
												<Avatar name={result.name} wallet={result.address} />
												{/* <img src={daoMember2} alt={result.address} />
												<Typography variant="body1" className={classes.nameText}>{result.name}</Typography> */}
											</Box>
											{/* <Box className={classes.avatarAddress}>
												<Typography className={classes.text}>
													{result.address &&
														result.address.slice(0, 6) +
														"..." +
														result.address.slice(-4)}
												</Typography>
											</Box> */}
											<Box className={classes.avatarBtn}>
												{result.address !== account && (
													<IconButton
														className={classes.deleteButton}
														onClick={() => {
															deleteMember(result.address);
														}}
													>
														<img src={closeOrange} alt="close-svg" />
													</IconButton>
												)}
											</Box>

										</Box>
									);
								})}
							</Box>
						</>
					)}
				</Box>
				{SelectThreshold()}
			</>
		);
	};

	return (
		<Container>
			<Grid className={classes.root}>
				<Box className={classes.StartSafe}>
					{!DAO ?
						<Skeleton variant="text" sx={{ mb: 2 }} className={classes.headerText} width={400} /> :
						<Box className={classes.headerText}>{!location?.state?.createFlow ? '' : '2/3'} Organisation's Safe Multi-sig Wallet</Box>
					}
					<Box className={classes.buttonArea}>
						<Box>
							{!DAO ?
								<Skeleton variant="rounded" width={228} height={50} /> :
								<Button
									sx={{
										color: "#C94B32",
										backgroundColor: "#FFFFFF",
										fontWeight: 400,
										minWidth: 'max-content',
										width: 228,
										boxShadow: '3px 5px 20px rgba(27, 43, 65, 0.12), 0px 0px 20px rgba(201, 75, 50, 0.18)'
									}}
									variant='contained'>
									CREATE
								</Button>
							}
						</Box>
						<Box className={classes.centerText}>or</Box>
						<Box>
							{!DAO ? <Skeleton variant="rounded" width={228} height={50} /> :
								<Button
									sx={{
										backgroundColor: "#FFFFFF",
										minWidth: 'max-content',
										fontWeight: 400,
										opacity: 0.6,
										color: 'rgba(201, 75, 50, 0.6)',
										width: 228
									}}
									onClick={() => {
										navigate(`/${daoURL}/attach-safe/existing`, location?.state?.createFlow ? { state: { createFlow: true } } : {})
									}}
									variant='contained'>
									ADD EXISTING
								</Button>}
						</Box>
					</Box>
					<Box className={classes.bottomLine} />
					{!DAO ? <Skeleton variant="rectangular" height={200} className={classes.centerCardSkeleton} /> :
						<Box className={classes.centerCard}>
							<Box className={classes.inputFieldTitle}>Select Chain</Box>
							<Select
								selected={state?.selectedChainId}
								options={SUPPORTED_CHAIN_IDS.map(item => ({ label: CHAIN_INFO[item].label, value: item }))}
								selectStyle={{ py: 1 }}
								setSelectedValue={(value) => {
									setState((prev: any) => { return { ...prev, selectedChainId: value } })
								}}
							/>
						<Box sx={{ mt: 3, width:'100%' }}>
						<Box display="flex" flexDirection="row" alignItems="flex-start" justifyContent={'space-between'}>
							<Box className={classes.inputFieldTitle} sx={{ my: 1 }}>
								What do you want to call the multi-sig wallet?
							</Box>
							<Chip sx={{ mr: 1, opacity: 0.6 }} size="small" label="Optional" />
						</Box>
						<TextInput
							fullWidth
							placeholder="Pied Piper"
							inputProps={{ maxLength: 50 }}
							onChange={(e: any) => { setState((prev: any) => { return { ...prev, safeName: e.target.value } }) }}
						/>
					</Box>
						</Box>}
					{!validSafeDetails ?
						!DAO ? <Skeleton width={184} height={50} variant="rounded" /> : <Button disabled={!state.selectedChainId} onClick={() => handleValidSafeDetails()} variant='contained'>CONTINUE</Button> :
						InviteMembersBlock()
					}
				</Box>
			</Grid>
		</Container>
	);
};


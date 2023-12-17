import React, { useCallback, useMemo } from 'react';
import { find as _find, get as _get } from 'lodash';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { makeStyles } from '@mui/styles';
import palette from 'theme/palette';
import useENS from 'hooks/useENS';
import { useEffect, useState } from 'react';
import { beautifyHexToken } from 'utils';
import starDashboard from "assets/svg/star_dashboard.svg";
import tokenDashboard from "assets/svg/token_dashboard.svg";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAction, setNetworkConfig, setTokenAction, setUserAction } from 'store/actions/session';
import { useWeb3Auth } from 'context/web3Auth';
import ChainSwitchList from 'components/ChainSwitchList';
import { useAppSelector } from 'helpers/useAppSelector';
import { useDAO } from 'context/dao';
import useRole from 'hooks/useRole';
import { CHAIN_INFO } from 'constants/chainInfo';
import { useSafeTokens } from 'context/safeTokens';
import Avatar from 'components/Avatar';
import ProfileModal from 'modals/Profile/ProfileModal';

const useStyles = makeStyles((theme: any) => ({
	root: {
		position: 'relative',
		width: 223,
		cursor: 'pointer',
		height: 60,
		background: `#FFFFFF`,
		boxShadow: `3px 5px 4px rgba(27, 43, 65, 0.05), -3px -3px 8px rgba(201, 75, 50, 0.1)`,
		borderRadius: 30,
		display: 'flex',
		flexDirection: 'row',
		zIndex: 1
	},
	address: {
		fontStyle: 'italic',
		fontWeight: '400',
		fontSize: '14px !important',
		lineHeight: '18px !important',
		letterSpacing: '-0.011em !important',
		color: 'rgb(144, 144, 144)',
	},
	dropdown: {
		width: 50,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderLeft: '1px solid #F0F0F0'
	},
	sliderInfo: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		position: 'absolute',
		height: 60,
		right: 30,
		padding: "12px 200px 12px 11px",
		borderRadius: "30px 0 0 30px",
		backgroundColor: 'hsla(214,9%,51%,.05)',
/*		transition: '0.5s',
 		'&:hover': {
			transition: '0.5s',
			right: 200
		} */
	},
	rolePill: {
		color: '#76808d',
		gap: '23px',
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		padding: '10px 20px',
		height: 36,
		minWidth: 156,
		borderRadius: 100,
		backgroundColor: "hsla(214,9%,51%,.05)"
	},
	tokenText: {
		alignItems: "center",
		color: '#76808d !important',
		display: 'flex',
		fontFamily: 'Inter,sans-serif',
		fontSize: '16px !important',
		fontStyle: 'normal',
		fontWeight: '700 !important',
		letterSpacing: '-.011em',
		lineHeight: '18px !important',
		marginLeft: '6px !important'
	}
}));

export default ({ children, options = true, ...props }: any) => {
	const classes = useStyles();
	const dispatch = useDispatch();
	const { chainId, account, provider, switchChain, logout } = useWeb3Auth()
	//@ts-ignore
	const { user } = useAppSelector(store => store?.session);

	console.log("user , account : ", user, account)
	const { DAO } = useDAO();
	const { safeTokens } = useSafeTokens();
	const { displayRole } = useRole(DAO, account, undefined)
	const { getENSName } = useENS();
	const [accountName, setAccountName] = useState<string>();
	const [anchorEl, setAnchorEl] = useState<any>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: any) => setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);

	const [openProfile, setOpenProfile] = useState(false);

	useEffect(() => {
		if (account) {
			setAccountName(beautifyHexToken(account))
			getENSName(account)
				.then(ens => {
					if (ens)
						setAccountName(ens)
				})
		}
	}, [account])

	const disconnect = async () => {
		handleClose();
		// if (connector.deactivate) {
		//   connector.deactivate();
		// } else {
		//   connector.resetState();
		// }
		await localStorage.clear()
		sessionStorage.clear()
		dispatch(setTokenAction(null))
		dispatch(setUserAction(null))
		dispatch(logoutAction())
		try { await logout() } catch (e) { console.log(e) }
		await localStorage.setItem("MANUAL_DISCONNECT", "true")
		window.location.reload()
	};

	// const swtBalance = useMemo(() => {
	// 	if (DAO && user) {
	// 		const swt = _find(_get(user, 'earnings', []), (e: any) => e.currency === 'SWEAT' && e.daoId === _get(DAO, '_id'))
	// 		if (swt)
	// 			return _get(swt, 'value', 0)
	// 	}
	// 	return 0
	// }, [user, DAO])

	// const tokenDollarBalance = useMemo(() => {
	// 	if (DAO && user) {
	// 		let usdVal = 0
	// 		const myTokens = _get(user, 'earnings', []).filter((e: any) => e.daoId === _get(DAO, '_id'))
	// 		for (let index = 0; index < myTokens.length; index++) {
	// 			const myToken = myTokens[index];
	// 			const safeTkn = _find(safeTokens, (st: any) => (st.tokenAddress ? st.tokenAddress : process.env.REACT_APP_NATIVE_TOKEN_ADDRESS) === myToken.currency)
	// 			if (safeTkn) {
	// 				console.log("safeTkn", safeTkn, myToken)
	// 				usdVal = usdVal + (+_get(safeTkn, 'fiatConversion', 0) * _get(myToken, 'value', 0))
	// 			}
	// 		}
	// 		return (usdVal || 0).toFixed(2)
	// 	}
	// 	return 0
	// }, [user, safeTokens, DAO])

	const handleSwitch = async (nextChainId: number) => {
		try {
			const chainInfo = CHAIN_INFO[nextChainId]
			dispatch(setNetworkConfig({ selectedChainId: nextChainId, chain: chainInfo.chainName, web3AuthNetwork: chainInfo.network }))
			await switchChain(chainInfo?.chainId)
		} catch (e) {
			console.log(e)
		}
	}

	const swtBalance = useMemo(() => {
		if (DAO && user) {
			const swt = _find(_get(user, 'earnings', []), (e: any) => e.currency === 'SWEAT' && e.daoId === _get(DAO, '_id'))
			if (swt)
				return _get(swt, 'value', 0)
		}
		return 0
	}, [user, DAO])

	const tokenDollarBalance = useMemo(() => {
		if (DAO && user && safeTokens) {
			let usdVal = 0
			const myTokens = _get(user, 'earnings', []).filter((e: any) => e.daoId === _get(DAO, '_id'))
			console.log("tokenDollarBalance", safeTokens, myTokens);
			for (let index = 0; index < myTokens.length; index++) {
				const myToken = myTokens[index];
				let safeTkn = null;
				let tkns = Object.values(safeTokens);
				for (let index = 0; index < tkns.length; index++) {
					const element: any = tkns[index];
					safeTkn = _find(element, (st: any) => {
						if (element?.symbol === "GOR" || element?.symbol === "GörETH") {
							return ((st?.tokenAddress || process.env.REACT_APP_NATIVE_TOKEN_ADDRESS) && st?.token?.symbol === "GörETH") === myToken?.currency
						}
						return ((st?.tokenAddress || process.env.REACT_APP_NATIVE_TOKEN_ADDRESS)) === myToken?.currency
					})
					if (safeTkn) break;
				}
				if (safeTkn) {
					console.log("safeTkn", safeTkn, myToken)
					usdVal = usdVal + (+_get(safeTkn, 'fiatConversion', 0) * _get(myToken, 'value', 0))
				}
			}
			return (usdVal || 0).toFixed(2)
		}
		return 0
	}, [user, safeTokens, DAO?.url])

	return (
		<Box display="flex" position="relative">
			<ProfileModal
				open={openProfile}
				closeModal={() => setOpenProfile(false)}
			/>
			<Box id="account-options" {...props} className={classes.root}>
				<Box sx={{ pl: 2 }} display="flex" flexDirection="row" alignItems="center" flexGrow={1} onClick={handleClick}>
					<Avatar
						name={user?.name}
						wallet={account}
					/>
				</Box>
				<Box sx={{ p: 2 }} className={classes.dropdown} onClick={handleClick}>
					<IconButton disabled>
						<ExpandMoreIcon />
					</IconButton>
				</Box>
			</Box>
			{options && <Box className={classes.sliderInfo}>
				<Box className={classes.rolePill}>
					<Typography style={{ fontSize: '14px', clear: 'both', display: 'inline-block', textAlign: 'center', whiteSpace: 'nowrap' }}>{displayRole}</Typography>
				</Box>
				{/* <Box sx={{ mx: 1 }} display="flex" flexDirection="row" alignItems="center">
					<Box display="flex" flexDirection="row" alignItems="center">
						<img src={tokenDashboard} />
						<Typography className={classes.tokenText}>${tokenDollarBalance}</Typography>
					</Box>
					<Box sx={{ ml: 1 }} display="flex" flexDirection="row" alignItems="center">
						<img src={starDashboard} />
						<Typography className={classes.tokenText}>{swtBalance}</Typography>
					</Box>
				</Box> */}
				<Box sx={{ ml: 1 }}>
					<ChainSwitchList onselect={(chain: any) => handleSwitch(chain)} chainId={chainId} />
				</Box>
			</Box>}
			<Menu
				key="account-options-menu"
				id="account-options-menu"
				MenuListProps={{
					'aria-labelledby': 'account-options',
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'center',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
			>
				<MenuItem onClick={() => { handleClose(); setOpenProfile(true); }}>Profile</MenuItem>
				<MenuItem onClick={() => { handleClose(); disconnect(); }}>Disconnect</MenuItem>
			</Menu>
		</Box>
	);
}

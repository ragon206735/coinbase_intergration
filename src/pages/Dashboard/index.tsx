import { Box, Stack } from "@mui/material";
import {
  get as _get,
  find as _find,
  uniqBy as _uniqBy,
  sortBy as _sortBy,
} from "lodash";
import { useDAO } from "context/dao";
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { makeStyles } from "@mui/styles";
import axiosHttp from "api";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, useMediaQuery, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WalkThroughPopover from "components/WalkThroughPopover";
import WalkThroughModal from "components/WalkThroughModal";
import Links from "./Links";
import Notifications from "./Notifications";
import TaskSection from "sections/TaskSection";
import ProjectSection from "sections/ProjectSection";
import MembersSection from "sections/MembersSection";
import { useAppSelector } from "helpers/useAppSelector";
import Treasury from "./Treasury";
import Steps from "constants/walkthroughsteps";
import questionMarkDark from "assets/svg/question-mark-dark.svg";
import questionMarkLight from "assets/svg/question-mark-light.svg";
import LOMADLOGO from "../../assets/svg/lomadsLogoRed.svg";
import MOBILEDEVICE from "../../assets/svg/mobile_device.svg";
import { useWeb3Auth } from "context/web3Auth";
import useRole from "hooks/useRole";
import Button from "components/Button";
import moment from "moment";
import { beautifyHexToken } from "utils";
import { CHAIN_INFO } from "constants/chainInfo";
import { GNOSIS_SAFE_BASE_URLS, SupportedChainId } from "constants/chains";
import ProfileModal from "modals/Profile/ProfileModal";
import useGnosisTxnTransform from "hooks/useGnosisTxnTransform";
import Proposals from "./Proposals";
import { updateUserOnboardingCountAction } from "store/actions/dao";
import { useAppDispatch } from "helpers/useAppDispatch";
import useDeployer from "hooks/useDeployer";
import Balance from "./Balance";

type WalkThroughObjType = {
  step: number;
  id: string;
  title: string;
  content: string;
  buttonText: string;
  imgPath: string;
  placement: string;
};

const useStyles = makeStyles((theme: any) => {
  console.log(theme.zIndex.appBar, "...z...");
  return {
    root: {
      display: "flex",
      background: `linear-gradient(169.22deg,#fdf7f7 12.19%,#efefef 92%)`,
      minHeight: "100vh",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden !important",
    },
    helpOption: {
      bottom: "44px",
      position: "fixed",
      width: "50px",
      borderRadius: "50%",
      cursor: "pointer !important",
    },
    PlayWalkThroughButton: {
      color: "#C94B32 !important",
      backgroundColor: "#FFFFFF !important",
      cursor: "pointer",
      width: "198px !important",
      height: "40px !important",
      borderRadius: "5px !important",
      padding: "0px !important",
      fontFamily: "Inter, sans-serif",
      fontSize: "16px !important",
      "&:hover": {
        backgroundColor: "#FFFFFF !important",
      },
    },
    HideHelpIconButton: {
      color: "#ffffff !important",
      backgroundColor: "#1B2B41 !important",
      cursor: "pointer",
      width: "198px !important",
      height: "40px !important",
      borderRadius: "5px !important",
      padding: "0px !important",
      fontFamily: "Inter, sans-serif",
      fontSize: "16px !important",
      "&:hover": {
        backgroundColor: "#1B2B41 !important",
      },
    },
    walkThroughOverlay: {
      width: "100vw",
      height: "100vh",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      position: "fixed",
      zIndex: theme.zIndex.appBar + 1,
      background: "#1B2B41",
      opacity: 0.2,
    },
    subtitle1: {
      fontSize: "25px !important",
      fontWeight: "400 !important",
      lineHeight: "30px !important",
      textAlign: "center",
      color: "#B12F15",
      margin: "30px 0 !important",
    },
    subtitle2: {
      fontSize: "38px !important",
      lineHeight: "42px !important",
      textTransform: "uppercase",
      color: "#1B2B41",
    },
  };
});

export default () => {
  const { daoURL } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((store: any) => store?.session);
  const { DAO, DAOList, updateIsHelpOpen } = useDAO();
  const classes = useStyles();
  console.log("DAO", DAO);
  const [currWalkThroughObj, setWalkThroughObj] = useState<any>(Steps("")[0]);
  const [showWalkThrough, setShowWalkThrough] = useState<boolean>(false);
  const [isHelpIconOpen, setIsHelpIconOpen] = useState<boolean>(false);
  const anchorRef = useRef<any>();
  const questionMarkRef = useRef<any>();
  const { account } = useWeb3Auth();
  const { myRole, can } = useRole(DAO, account, undefined);
  const { transformTx } = useGnosisTxnTransform();

  const matches = useMediaQuery("(min-width:992px)");
  // @ts-ignore
  const { setProjectLoading, Project } = useAppSelector(
    (store) => store.project
  );

  useEffect(() => {
    updateIsHelpOpen(isHelpIconOpen);
  }, [isHelpIconOpen]);

  useEffect(() => {
    if (
      DAO &&
      user &&
      (!user?.onboardingViewCount ||
        (user?.onboardingViewCount &&
          user?.onboardingViewCount.indexOf(_get(DAO, "_id", "")) === -1 &&
          user?.onboardingViewCount.length < 2))
    )
      setShowWalkThrough(true);
  }, [DAO, user]);

  // const send = async () => {
  //     try {
  //         await axiosHttp.post(`utility/send-alert`, { alertType: 'mint-success', to: ["kyle@reputable.health"], data: {
  //             organizationName: "Reputable",
  //             organizationLogo: "https://lomads-dao-development.s3.eu-west-3.amazonaws.com/SBT/XhtV_5RqsUvyid7TzP1fqj7ZQ6-getQq.png",
  //             sbtName: `The Quantified Collective Membership  SBT #54`,
  //             mintDate: moment().local().format('DD-MMM-YYYY'),
  //             contractAddress:  beautifyHexToken("0xeD14Cc04f234dC7c10758Ef0A9ce6E11368572DB"),
  //             tokenId: 54,
  //             chain: CHAIN_INFO[SupportedChainId.POLYGON].label,
  //             lomadsLink: `https://sbt.lomads.xyz/mint/${"0xeD14Cc04f234dC7c10758Ef0A9ce6E11368572DB"}`,
  //             chainLogo: `https://lomads-dao-development.s3.eu-west-3.amazonaws.com/EmailAssets/${CHAIN_INFO[SupportedChainId.POLYGON].chainName}.png`,
  //             image: "https://lomads-dao-development.s3.eu-west-3.amazonaws.com/SBT/GHzuG21YyuD6i2msMNWE_kGeRJ3JO3ZC.png",
  //             link: `${CHAIN_INFO[SupportedChainId.POLYGON]?.explorer}token/${"0xeD14Cc04f234dC7c10758Ef0A9ce6E11368572DB"}?a=${54}`,
  //             openSea: `${CHAIN_INFO[SupportedChainId.POLYGON]?.opensea}${"0xeD14Cc04f234dC7c10758Ef0A9ce6E11368572DB"}/${54}`,
  //             redirectUrl: "https://www.quantifiedcollective.org/welcome"
  //         } })
  //     } catch (e) {
  //         console.log(e)
  //     }
  // }

  const expandHelpOptions = () => {
    setIsHelpIconOpen(!isHelpIconOpen);
  };
  const startWalkThroughAtStepOne = () => {
    setShowWalkThrough(true);
    const workspace = Steps("")[1];
    setWalkThroughObj(workspace);
    setWalkThroughStyles(workspace);
  };

  const getQuestionImage = (): string => {
    return (showWalkThrough && currWalkThroughObj?.step === 7) || isHelpIconOpen
      ? questionMarkDark
      : questionMarkLight;
  };

  const setWalkThroughStyles = (nextObj: WalkThroughObjType) => {
    anchorRef.current = document.getElementById(nextObj.id);
    anchorRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  };

  const incrementWalkThroughSteps = () => {
    if (currWalkThroughObj?.step === 7) {
      endWalkThrough();
      return;
    }

    let nextStep = currWalkThroughObj?.step + 1;
    while (
      showWalkThrough &&
      !document.getElementById(Steps("")[nextStep]?.id) &&
      nextStep < 7
    ) {
      nextStep++;
    }
    const nextObj = Steps("")[nextStep];
    setWalkThroughStyles(nextObj);
    setWalkThroughObj(nextObj);
  };
  const endWalkThrough = () => {
    dispatch(updateUserOnboardingCountAction({ daoId: _get(DAO, "_id", "") }));
    setShowWalkThrough(false);
    setWalkThroughObj(Steps("")[0]);
  };

  useEffect(() => {
    function handleClick(event: any) {
      const className = event.target.className;
      if (
        isHelpIconOpen &&
        (className.includes("help-card") ||
          className.includes("walkThroughOverlay") ||
          className.includes("bold-text") ||
          className.includes("help-card-content"))
      ) {
        event.preventDefault();
        setIsHelpIconOpen(false);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  });

  const loadAllSafeTokens = async () => {
    let { data } = await axiosHttp.get(`/utility/update-safe`);
    data = _uniqBy(data, (s: any) => s.address);
    const safes: any = {};
    for (let index = 0; index < data.length; index++) {
      const safe = data[index];
      // console.log(safe)
      // let chain = 5
      // let gnosisSafe: any  = null;
      // try {
      //     gnosisSafe = await axios.get(`${GNOSIS_SAFE_BASE_URLS[`${chain}`]}/api/v1/safes/${safe?.address}/`, { withCredentials: false }).then(res => res.data)
      // } catch (e) {
      //     chain = 137
      //     try {
      //         gnosisSafe = await axios.get(`${GNOSIS_SAFE_BASE_URLS[`${chain}`]}/api/v1/safes/${safe?.address}/`, { withCredentials: false }).then(res => res.data)
      //     } catch (e) {
      //         chain = 1
      //         gnosisSafe = await axios.get(`${GNOSIS_SAFE_BASE_URLS[`${chain}`]}/api/v1/safes/${safe?.address}/`, { withCredentials: false }).then(res => res.data)
      //     }
      // }
      // console.log(safe?.address, chain)
      // await axiosHttp.patch(`/safe/${safe?.address}`, { chainId: chain })
      try {
        const response: any = await axios.get(
          `${GNOSIS_SAFE_BASE_URLS[`${safe?.chainId}`]}/api/v1/safes/${
            safe?.address
          }/balances/usd/`,
          { withCredentials: false }
        );
        let t = response?.data;
        t = response?.data?.map((t: any) => {
          let tkn = t;
          if (!tkn.tokenAddress) {
            return {
              ...t,
              tokenAddress: process.env.REACT_APP_NATIVE_TOKEN_ADDRESS,
              token: {
                symbol: CHAIN_INFO[safe?.chainId].nativeCurrency.symbol,
                decimal: CHAIN_INFO[safe?.chainId].nativeCurrency.decimals,
                decimals: CHAIN_INFO[safe?.chainId].nativeCurrency.decimals,
              },
            };
          }
          return t;
        });
        t.push({
          tokenAddress: "SWEAT",
          token: {
            symbol: "SWEAT",
            decimal: 18,
            decimals: 18,
          },
        });
        safes[safe?.address] = t;
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (e) {
        continue;
      }
    }
    console.log("ALL_SAFES", safes);
  };

  const updateTask = async () => {
    const { data } = await axiosHttp.get(`/utility/update-safe`);
    for (let index = 0; index < data.length; index++) {
      const txn = data[index];
      try {
        const transformedTxns = await transformTx(
          txn.rawTx,
          [],
          txn?.safeAddress
        );
        for (let index = 0; index < transformedTxns.length; index++) {
          try {
            const t = transformedTxns[index];
            if (t?.to && t?.to !== "0x" && t.symbol && t.symbol !== "") {
              await axiosHttp.post(`/gnosis-safe/update-metadata`, {
                txId: txn?._id,
                recipient: t?.to,
                key: "parsedTxValue",
                value: {
                  value: t?.value,
                  formattedValue: t?.formattedValue.toString(),
                  symbol: t?.symbol,
                  decimals: t?.decimals,
                  tokenAddress: t?.tokenAddress,
                },
              });
            }
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (e) {
            continue;
          }
        }
      } catch (e) {
        continue;
      }
    }
    alert("COMPLETED");
  };

  if (matches) {
    return (
      <Grid container >
        <Grid item sm={12}>
          <Links
            highlightSettings={currWalkThroughObj.step === 6 || isHelpIconOpen}
            isHelpIconOpen={isHelpIconOpen}
          />
        </Grid>
        <Grid mt={1} item sm={12}>
          <Notifications isHelpIconOpen={isHelpIconOpen} />
        </Grid>
        <Grid
          sm={12}
          id="my-workspace"
          sx={{ zIndex: currWalkThroughObj.step === 1 ? 1400 : 0 }}
        >
          <ProjectSection isHelpIconOpen={isHelpIconOpen} />
        </Grid>
        <Grid
          sm={12}
          id="my-task"
          sx={{ zIndex: currWalkThroughObj.step === 2 ? 1400 : 0 }}
        >
          <TaskSection isHelpIconOpen={isHelpIconOpen} />
        </Grid>
        {/* <Grid sm={12}>
                <Proposals />
            </Grid> */}

        {can(myRole, "transaction.view") && (
          <Grid
            mt={1}
            id="treasury-management"
            item
            sm={12}
            sx={{
              zIndex:
                currWalkThroughObj.step === 4 || currWalkThroughObj.step === 3
                  ? 1400
                  : 0,
            }}
          >
            <Treasury
              showWalkThrough={showWalkThrough}
              isHelpIconOpen={isHelpIconOpen}
            />
          </Grid>
        )}


        {can(myRole, "transaction.view") && (
        <Balance/>
        )}



        {can(myRole, "members.view") && (
          <Grid
            sm={12}
            sx={{ zIndex: currWalkThroughObj.step === 5 ? 1400 : 0 }}
            id="members"
          >
            <MembersSection
              list={_get(DAO, "members", [])}
              showProjects={false}
              isHelpIconOpen={isHelpIconOpen}
              highlightMembers={currWalkThroughObj.step === 5}
            />
          </Grid>
        )}
        <Box
          sx={{
            width: "100%",
            position: "fixed",
            left: "33px",
            bottom: "44px",
            cursor: "pointer",
            zIndex: isHelpIconOpen ? 1300 : 1000,
          }}
          id="question-mark"
          ref={questionMarkRef}
          onClick={expandHelpOptions}
        >
          {isHelpIconOpen && (
            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                height: 100,
              }}
            >
              <Button
                variant="contained"
                className={classes.PlayWalkThroughButton}
                onClick={startWalkThroughAtStepOne}
              >
                Play walk through
              </Button>
              <Button
                startIcon={<CloseIcon />}
                className={classes.HideHelpIconButton}
                onClick={() => (questionMarkRef.current.style.display = "none")}
                variant="contained"
              >
                Hide help icon
              </Button>
            </Box>
          )}
          <img src={getQuestionImage()} />
        </Box>
        {(showWalkThrough || isHelpIconOpen) && (
          <Box className={classes.walkThroughOverlay}></Box>
        )}
        {showWalkThrough ? (
          <WalkThroughModal
            incrementWalkThroughSteps={incrementWalkThroughSteps}
            showConfirmation={showWalkThrough && currWalkThroughObj?.step === 0}
            endWalkThrough={endWalkThrough}
            obj={currWalkThroughObj}
          />
        ) : null}
        <WalkThroughPopover
          displayPopover={showWalkThrough && currWalkThroughObj?.step > 0}
          obj={currWalkThroughObj}
          incrementWalkThroughSteps={incrementWalkThroughSteps}
          endWalkThrough={endWalkThrough}
          anchorEl={anchorRef.current}
        />

        <Box
          sx={{
            width: "100%",
            position: "fixed",
            left: "33px",
            bottom: "44px",
            cursor: "pointer",
            zIndex: isHelpIconOpen ? 1300 : 1000,
          }}
          id="question-mark"
          ref={questionMarkRef}
          onClick={expandHelpOptions}
        >
          {isHelpIconOpen && (
            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                height: 140,
              }}
            >
              <Button
                variant="contained"
                className={classes.PlayWalkThroughButton}
                onClick={startWalkThroughAtStepOne}
              >
                Play walk through
              </Button>
              <Button
                variant="contained"
                className={classes.PlayWalkThroughButton}
                onClick={() =>
                  window.open("https://lomads-1.gitbook.io/lomads/", "_blank")
                }
              >
                Documentation
              </Button>
              <Button
                startIcon={<CloseIcon />}
                className={classes.HideHelpIconButton}
                onClick={() => (questionMarkRef.current.style.display = "none")}
                variant="contained"
              >
                Hide help icon
              </Button>
            </Box>
          )}
          <img src={getQuestionImage()} />
        </Box>
        {(showWalkThrough || isHelpIconOpen) && (
          <Box className={classes.walkThroughOverlay}></Box>
        )}
        {showWalkThrough ? (
          <WalkThroughModal
            incrementWalkThroughSteps={incrementWalkThroughSteps}
            showConfirmation={showWalkThrough && currWalkThroughObj?.step === 0}
            endWalkThrough={endWalkThrough}
            obj={currWalkThroughObj}
          />
        ) : null}
        <WalkThroughPopover
          displayPopover={showWalkThrough && currWalkThroughObj?.step > 0}
          obj={currWalkThroughObj}
          incrementWalkThroughSteps={incrementWalkThroughSteps}
          endWalkThrough={endWalkThrough}
          anchorEl={anchorRef.current}
        /> 
      </Grid>
    );
  } else {
    return (
      <Grid container className={classes.root}>
        <Grid
          xs={12}
          item
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Box position="absolute" top={0} left={0} sx={{ padding: "30px" }}>
            <img src={LOMADLOGO} />
          </Box>
          <Box>
            <img src={MOBILEDEVICE} />
          </Box>
          <Box sx={{ padding: "0 30px" }}>
            <Typography className={classes.subtitle1}>
              Lomads app needs a PC
              <br />
              for now.
            </Typography>
            <Typography
              className={classes.subtitle2}
              sx={{ fontWeight: "800" }}
            >
              CATCH YOU <br />
              ON THE{" "}
              <span
                style={{
                  fontWeight: "300",
                  fontStyle: "italic",
                  color: "#C94B32",
                }}
              >
                <br />
                BIG SCREEN
              </span>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  }
};
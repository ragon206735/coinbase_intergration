import React from "react";
import BasicModal from 'components/BasicModal'
import { Button, Stack, Box} from '@mui/material';
import CloseBtn from 'assets/svg/close-btn.svg';
import WalkThroughStart from 'assets/svg/step_0_walkthrough.svg'
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: any) => ({
    confirmWalkthrough: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "35px",
        background: "#FFFFFF",
        border: "none !important",
        overflow: "hidden",
        padding: "40px !important",
        borderRadius: "20px",
        width: "700px",
        height: "490px",
        position: "relative"
      },
      closeBtn: {
        cursor: "pointer",
        position: "absolute",
        right: "2%",
        top: "3%",
        background: "linear-gradient(180deg, #FBF4F2 0%, #EEF1F5 100%)",
        borderRadius: "'10%'"
      },
      modalModalTitle: {
        color: "#C94B32",
        fontFamily: "'Inter', sans-serif",
        fontStyle: "normal",
        fontWeight: 400,
        fontSize: "30px !important",
        lineHeight: "33px !important",
        textAlign: "center"
      },
      textContent: {
        fontFamily: "'Inter', sans-serif",
        fontStyle: "normal",
        fontWeight: 400,
        alignSelf: "center",
        textAlign: "center",
        color: "#76808D",
        paddingBottom: "15px !important"
      },
}));

export default function WalkThrough({
  showConfirmation,
  incrementWalkThroughSteps,
  endWalkThrough,
  obj,
}: {
  showConfirmation: boolean,
  incrementWalkThroughSteps: any,
  endWalkThrough: any,
  obj: any
}) {
  
  const classes = useStyles();

  return (
    <BasicModal
        isOpen={showConfirmation}
        key={showConfirmation.toString() + Math.random() + 'walkThrough'}
        closeModal={endWalkThrough}
       >
      <Box className={classes.confirmWalkthrough}>
        <Box className={classes.closeBtn} onClick={endWalkThrough}>
          <img src={CloseBtn} />
        </Box>
        <img src={WalkThroughStart} />
        <Typography className={classes.modalModalTitle}>
         {obj.title}
        </Typography>
        <p className={classes.textContent} dangerouslySetInnerHTML={{ __html: obj?.content }} />
        <Stack spacing={2} direction="row">
          <Button
            variant="outlined"
            onClick={endWalkThrough}
            size="small">
            No, Thanks!
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={incrementWalkThroughSteps}
          >
            Let's Go
          </Button>
        </Stack>
      </Box>
    </BasicModal>
  );
}
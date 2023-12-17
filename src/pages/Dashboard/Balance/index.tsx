import React, { useContext, useState } from "react";
import {
  find as _find,
  orderBy as _orderBy,
  get as _get,
  uniqBy as _uniqBy,
} from "lodash";
import { Grid, Box, Skeleton,Typography, Tabs, Tab, TableContainer, Table, TableBody } from "@mui/material";
import NFTSection from "./NFT";
import TokenSection from "./Tokens";
import { useStyles } from "./Styles";
import balance_symbol from "assets/images/Balance/balance_symbol.png";
import { SafeTokensContext } from "context/safeTokens";

export default () => {
  const classes = useStyles();
  const { totalBalance } = useContext(SafeTokensContext);
  const [activeTab, setActiveTab] = useState(0);

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  return (
    <Grid container className={classes.root}>
      <Grid item sm={12}>
          <Box className={classes.header}>
          <Tabs
            value={activeTab}
            onChange={(e: any, val: any) => setActiveTab(val)}
            aria-label="basic tabs example"
            TabIndicatorProps={{ hidden: true }}
            sx={{
              "& button": {
                color: "rgba(118, 128, 141,0.5)",
                marginRight: "10px",
                textTransform: "capitalize",
                fontSize: "22px",
                fontWeight: "400",
              },
              "& button.Mui-selected": { color: "rgba(118, 128, 141,1)" },
            }}
          >
            <Tab label="Tokens" {...a11yProps(0)} />
            <Tab label="NFTs" {...a11yProps(1)} />
          </Tabs>
        </Box>
      </Grid>



      <Grid className="relative" mt={0.5} item sm={12}>
{/*         <Box className={classes.tokenHeader}>
            <Box>
                <Typography style={{ color: "#188C7C", fontWeight: "700", fontSize: 14 }}>{`$${totalBalance.toFixed(3)} Total Balance`}</Typography>
          </Box>
        </Box> */}
      </Grid>

      <Grid className="relative" mt={0.5} mb={1} item sm={12}>
      <Box className={classes.table}>
                                <TableContainer style={{ maxHeight: 500 }} component={Box}>
                                    <Table size="medium" stickyHeader aria-label="simple table">
                                        <TableBody>
                                            {activeTab == 0 ? (
                                                    <Box className="bg-white rounded-md w-full">
                                                      <TokenSection />
                                                    </Box>
                                                  ) : (
                                                    <Box className="bg-white rounded-md w-full">
                                                      <NFTSection />
                                                    </Box>
                                                  )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
      </Grid>



{/*       <Grid className="relative" mt={0.5} mb={1} item sm={12}>
        {activeTab == 0 ? (
          <Box className="bg-white rounded-md w-full">
            <TokenSection />
          </Box>
        ) : (
          <Box className="bg-white rounded-md w-full">
            <NFTSection />
          </Box>
        )}
      </Grid> */}
    </Grid>
  );
};
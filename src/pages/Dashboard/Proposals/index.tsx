import React, { useState, useEffect, useMemo } from "react";
import { get as _get, find as _find, orderBy as _orderBy, uniqBy as _uniqBy } from 'lodash';
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { makeStyles } from '@mui/styles';
import { useDAO } from "context/dao";
import { useNavigate } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import ProposalCard from "components/ProposalCard";

const useStyles = makeStyles((theme: any) => ({
    showAllCard: {
        width: '315px',
        height: '110px',
        display: 'flex !important',
        alignItems: 'center !important',
        background: 'linear-gradient(180deg, #fbf4f2, #eef1f5) !important',
        borderRadius: '5px !important',
        cursor: 'pointer !important',
        justifyContent: 'center !important',
        marginBottom: '15px !important',
        marginRight: '20px !important',
        position: 'relative'
    },
}));

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
    style?: any;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, style, ...other } = props;

    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            style={style}
            {...other}
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </Box>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default () => {
    const classes = useStyles();
    const navigate = useNavigate();
    const { DAO } = useDAO();
    const PROPOSALS_QUERY = gql`
  {
  proposals (
    first: 20,
    skip: 0,
    where: {
      space_in: ["aave.eth"],
      state: "closed"
    },
    orderBy: "created",
    orderDirection: desc
  ) {
    id
    title
    body
    choices
    start
    end
    snapshot
    state
    scores
    scores_by_strategy
    scores_total
    scores_updated
    author
    space {
      id
      name
    }
  }
}
`;
    const { data, loading, error } = useQuery(PROPOSALS_QUERY);

    console.log("proposals : ", data);

    if (loading) return null;
    if (error) return null;

    return (
        <Box sx={{ width: '100%' }} display="flex" flexDirection={"column"}>

            <Box sx={{ width: '100%', background: '#FFF', height: '75px', padding: '0px 22px', borderRadius: '5px' }} display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                <Tabs
                    value={0}
                    aria-label="basic tabs example"
                    TabIndicatorProps={{
                        hidden: true
                    }}
                    sx={{
                        '& button': { color: 'rgba(118, 128, 141,0.5)', marginRight: '10px', textTransform: 'capitalize', fontSize: '22px', fontWeight: '400' },
                        '& button.Mui-selected': { color: 'rgba(118, 128, 141,1)' },
                    }}
                >
                    <Tab label={`Proposals`} {...a11yProps(0)} />
                </Tabs>
            </Box>

            {/* Tab panel for proposals */}
            <TabPanel value={0} index={0} style={{ marginTop: '0.2rem' }}>
                <Box sx={{ width: '100%', background: '#FFF', padding: '26px 22px 26px 22px', borderRadius: '5px', maxHeight: '275px', overflow: 'hidden' }} display={"flex"} alignItems={"center"} flexWrap={"wrap"}>
                    {
                        data?.proposals?.filter((i: any, index: number) => index < 6).map((item: any, index: number) => {
                            if (index <= 4) {
                                return (
                                    <Box key={index}>
                                        <ProposalCard
                                            proposal={item}
                                            daoUrl={DAO?.url}
                                        />
                                    </Box>
                                )
                            }
                            else {
                                return (
                                    <Box
                                        key={index}
                                        className={classes.showAllCard}
                                    // onClick={() => { navigate(`/${DAO.url}/tasks`, { state: { active: value } }) }}
                                    >
                                        <Typography sx={{ color: '#b12f15' }}>SHOW ALL</Typography>
                                    </Box>
                                )
                            }
                        })
                    }
                </Box>
            </TabPanel>
        </Box>
    )
}
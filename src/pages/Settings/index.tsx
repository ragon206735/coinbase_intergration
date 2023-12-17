import React, { Fragment, useEffect, useMemo, useState } from 'react'
import { get as _get } from 'lodash'
import { Box, Grid, Typography, Drawer } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { ChevronRight } from '@mui/icons-material'
import CloseSVG from 'assets/svg/close-new.svg'
import OrganistionDetails from 'assets/images/settings-page/1-ogranisation-details.svg'
import RolesPermissions from 'assets/images/settings-page/2-roles-permissions.svg'
import Safe from 'assets/images/settings-page/3-safe.svg'
import PassTokens from 'assets/images/settings-page/4-pass-tokens.svg'
import XpPoints from 'assets/images/settings-page/5-xp-points.svg'
import Terminology from 'assets/images/settings-page/6-terminology.svg'
import IntegrationGrey from 'assets/svg/integrations.svg'
import Skeleton from '@mui/material/Skeleton'
import SafeModal from './Modals/Safe'
import PassTokenModalV2 from './Modals/PassToken/index.v2'
import PassTokenModal from './Modals/PassToken'
import TerminologyModal from './Modals/Terminology'
import RolesModal from './Modals/Roles'
import XPPoints from './Modals/XPPoints'
import Organisation from './Modals/Organisation'
import IntegrationModal from './Modals/Integration'
import { useDAO } from 'context/dao'
import theme from 'theme'
import { useLocation } from 'react-router-dom'
import axiosHttp from 'api'

const useStyles = makeStyles((theme: any) => ({
  item: {
    cursor: 'pointer',
    backgroundColor: '#FFF',
    width: '100%',
    height: 130,
    borderRadius: 20,
    padding: 25,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  title: {
    fontFamily: 'Inter, sans-serif',
    fontStyle: 'normal',
    fontWeight: '400 !important',
    fontSize: '18px !important',
    lineHeight: '25px !important',
    letterSpacing: '-0.011em',
    color: '#C94B32',
  },
}))

const Content = ({
  icon,
  title,
  onClick,
}: {
  icon: any | undefined
  title: string | undefined
  onClick: any
}) => {
  const classes = useStyles()
  const { DAO } = useDAO()
  if (!DAO) {
    return (
      <Skeleton
        variant='rectangular'
        animation='wave'
        height={130}
        className={classes.item}
        width={'100%'}
      />
    )
  }
  return (
    <Box
      onClick={onClick}
      className={classes.item}
    >
      <Box>
        <img src={icon} />
      </Box>
      <Box
        display='flex'
        flexDirection='row'
        alignItems='center'
        justifyContent='space-between'
      >
        <Typography className={classes.title}>{title}</Typography>
        <ChevronRight color='primary' />
      </Box>
    </Box>
  )
}

export default () => {
  const [activeModal, setActiveModal] = useState<string | null>(null)
  const { DAO } = useDAO()
  const location = useLocation()

  const Modal = useMemo(() => {
    if (activeModal === SafeModal.name) return SafeModal
    if (activeModal === PassTokenModal.name) return PassTokenModal
    if (activeModal === PassTokenModalV2.name) return PassTokenModalV2
    if (activeModal === TerminologyModal.name) return TerminologyModal
    if (activeModal === RolesModal.name) return RolesModal
    if (activeModal === XPPoints.name) return XPPoints
    if (activeModal === Organisation.name) return Organisation
    if (activeModal === IntegrationModal.name) return IntegrationModal
    return Fragment
  }, [activeModal])

  useEffect(() => {
    if (DAO?.url && location?.state?.openDefault)
      setActiveModal(location?.state?.openDefault)
  }, [DAO?.url, location?.state?.openDefault])

  console.log('activeModal : ', activeModal)
  console.log('DAO: ', DAO)

  return (
    <>
      <Grid
        container
        px={3}
        spacing={2}
      >
        <Grid
          item
          sm={12}
        >
          <Content
            onClick={() => setActiveModal(Organisation.name)}
            icon={OrganistionDetails}
            title='Organisation Details'
          />
        </Grid>
        <Grid
          item
          sm={6}
          md={4}
          xs={1}
        >
          <Content
            onClick={() => setActiveModal(RolesModal.name)}
            icon={RolesPermissions}
            title='Roles & Permissions'
          />
        </Grid>
        <Grid
          item
          sm={6}
          md={4}
          xs={1}
        >
          <Content
            onClick={() => setActiveModal(SafeModal.name)}
            icon={Safe}
            title='Safes'
          />
        </Grid>
        <Grid
          item
          sm={6}
          md={4}
          xs={1}
        >
          <Content
            onClick={() =>
              setActiveModal(
                +_get(DAO, 'sbt.version', 0) >= 2
                  ? PassTokenModalV2.name
                  : PassTokenModal.name
              )
            }
            icon={PassTokens}
            title='Memebership Management'
          />
        </Grid>
        <Grid
          item
          sm={6}
          md={4}
          xs={1}
        >
          <Content
            onClick={() => setActiveModal(XPPoints.name)}
            icon={XpPoints}
            title='SWEAT Points'
          />
        </Grid>
        <Grid
          item
          sm={6}
          md={4}
          xs={1}
        >
          <Content
            onClick={() => setActiveModal(TerminologyModal.name)}
            icon={Terminology}
            title='Terminology'
          />
        </Grid>
        <Grid
          item
          sm={6}
          md={4}
          xs={1}
        >
          <Content
            onClick={() => setActiveModal(IntegrationModal.name)}
            icon={IntegrationGrey}
            title='Integrations'
          />
        </Grid>
      </Grid>
      <Drawer
        PaperProps={{
          style: { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
        }}
        sx={{ zIndex: theme.zIndex.appBar + 1 }}
        anchor={'right'}
        open={activeModal !== null}
        onClose={() => setActiveModal(null)}
      >
        <Box
          sx={{
            width: activeModal === RolesModal.name ? '960px' : '575px',
            flex: 1,
            padding:
              activeModal === RolesModal.name
                ? '32px 0px 32px 0px'
                : '32px 72px 32px 72px',
            borderRadius: '20px 0px 0px 20px',
          }}
        >
          <Modal
            //@ts-ignore
            open={activeModal !== null}
            onClose={() => setActiveModal(null)}
          />
        </Box>
      </Drawer>
    </>
  )
}

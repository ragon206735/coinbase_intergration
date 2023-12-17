import react, { useEffect, useMemo } from 'react'
import { filter as _filter, get as _get, find as _find, orderBy as _orderBy, uniqBy as _uniqBy, sortBy as _sortBy } from 'lodash'
import moment from 'moment';
import { useAppDispatch } from 'helpers/useAppDispatch';
import { useWeb3Auth } from 'context/web3Auth';
import { useAppSelector } from 'helpers/useAppSelector';
import { useDAO } from 'context/dao';
import { createAccountAction } from 'store/actions/session';
const { toChecksumAddress } = require('ethereum-checksum-address')

export default (rawTasks: Array<any>) => {
    const dispatch = useAppDispatch()
    const { account } = useWeb3Auth();
    const { DAO } = useDAO();
    const { user } = useAppSelector((state: any) => state.session);

    useEffect(() => {
        if (!user) {
            dispatch(createAccountAction({}))
        }
    }, [user])

    const canApply = (task: any) => {
        if (task.contributionType === 'open') {
            let user = _find(_get(DAO, 'members', []), m => _get(m, 'member.wallet', '').toLowerCase() === account?.toLowerCase())
            if (user) {
                if (task?.validRoles.length > 0) {
                    let myDiscordRoles: any = []
                    const discRoles = _get(user, 'discordRoles', {})
                    Object.keys(discRoles).forEach(key => {
                        myDiscordRoles = [...myDiscordRoles, ...discRoles[key]]
                    })
                    let index = task?.validRoles.findIndex((item: any) => item.toLowerCase() === user.role.toLowerCase() || myDiscordRoles.indexOf(item) > -1);
                    // return index > -1 ? true : false
                    if (index > -1) return true;
                }
                else if (task?.invitations && task?.invitations?.length > 0) {
                    let index = task?.invitations.findIndex((item: any) => item.address.toLowerCase() === account.toLowerCase());
                    // return index > -1 ? true : false
                    if (index > -1) return true;
                }
                else {
                    return true;
                }
            }
        }
        return false
    }

    const isOthersApproved = (task: any) => {
        if (task) {
            let user = _find(_get(task, 'members', []), m => _get(m, 'member.wallet', '').toLowerCase() !== account?.toLowerCase() && m.status === 'approved')
            if (user)
                return true
            return false
        }
        return false;
    };

    const taskApplicationCount = (task: any) => {
        if (task) {
            if (task.taskStatus === 'open' && task.isSingleContributor) {
                let applications = _get(task, 'members', []).filter((m: any) => (m.status !== 'rejected' && m.status !== 'submission_accepted' && m.status !== 'submission_rejected'))
                if (applications)
                    return applications.length
            }
        }
        return 0;
    };

    const taskSubmissionCount = (task: any) => {
        if (task) {
            if ((task.contributionType === 'open' && !task.isSingleContributor) || task.contributionType === 'assign') {
                let submissions = _get(task, 'members', [])?.filter((m: any) => m.submission && (m.status !== 'submission_accepted' && m.status !== 'submission_rejected'))
                if (submissions)
                    return submissions.length
            }
            return 0
        }
        return 0;
    };

    const amIApproved = (task: any) =>
        _find(_get(task, 'members', []), m => toChecksumAddress(_get(m, 'member.wallet', '')) === toChecksumAddress(account) && m.status === 'approved')

    const isDeadlinePassed = (task: any) => {
        if (task)
            if (moment().isAfter(moment(task.deadline)))
                return true
        return false
    }

    const parsedTasks = useMemo(() => {
        let tasks = _filter(rawTasks, rt => !rt.deletedAt && !rt.archivedAt && !rt.draftedAt);
        if (account && user) {
            let manage = _filter(tasks, tsk => tsk.reviewer === user._id)

            manage = manage.map(t => {
                let tsk = { ...t, notification: 0 };
                if (((t.contributionType === 'open' && !t.isSingleContributor) || t.contributionType === 'assign') && taskSubmissionCount(t) > 0) {
                    tsk['notification'] = 1
                } else {
                    if (taskApplicationCount(t) > 0) {
                        tsk['notification'] = 1
                    }
                }
                return tsk
            })
            manage = _orderBy(manage, ['notification', mt => moment(mt.updatedAt).unix()], ['desc', 'desc'])

            let myTask = _orderBy(_filter(tasks, tsk => {
                console.log(tsk?.name, "isDeadlinePassed", tsk.deadline, isDeadlinePassed(tsk))
                console.log(tsk?.name, canApply(tsk))
                return tsk.reviewer !== user._id
                    && (!isDeadlinePassed(tsk) || amIApproved(tsk)) &&
                    (canApply(tsk) ||
                        (
                            tsk.contributionType === 'open' && tsk.isSingleContributor && !isOthersApproved(tsk) ||
                            tsk.contributionType === 'open' && !tsk.isSingleContributor && canApply(tsk) ||
                            _find(tsk.members, m => m.member?.wallet?.toLowerCase() === account?.toLowerCase())
                        ))
            }), (mt: any) => moment(mt.updatedAt).unix(), 'desc');
            let drafts = rawTasks.filter(task => !task.deletedAt && !task.archivedAt && task.draftedAt !== null && (task.creator === user?._id || task.provider === 'Github' || task.provider === 'Trello'))
            let allTasks = _orderBy(_uniqBy([...manage, ...(tasks.filter(tsk => (!isDeadlinePassed(tsk) || amIApproved(tsk))))], t => t._id), t => t.createdAt, ['desc'])
            return { tasks, manage, myTask, drafts, allTasks }
        }
        return { tasks: [], manage: [], myTask: [], drafts: [], allTasks: tasks }
    }, [rawTasks, account, user])

    return { parsedTasks, canApply }

}
import React, { useEffect, useState } from "react";
import { find as _find, get as _get, debounce as _debounce } from 'lodash';
import '../../Project/ArchiveProjects/style.css';
import { useDAO } from "context/dao";
import { useNavigate, useParams } from "react-router-dom";
import { IoIosArrowBack } from 'react-icons/io'
import TaskCard from "components/TaskCard";
import useTerminology from 'hooks/useTerminology';

export default () => {
    const navigate = useNavigate();
    const { DAO } = useDAO();
    const { projectId } = useParams();
    const { transformTask, transformWorkspace } = useTerminology(_get(DAO, 'terminologies', null))
    const [archivedTasks, setArchivedTasks] = useState([]);

    useEffect(() => {
        if (DAO) {
            if (projectId) {
                let tasks = _find(_get(DAO, 'projects', []), p => _get(p, '_id', '').toLowerCase() === projectId.toLowerCase()).tasks.filter((t: any) => !t.deletedAt && t.archivedAt)
                if (tasks.length === 0) {
                    setTimeout(() => {
                        navigate(`/${DAO.url}`);
                    }, 2000);
                }
                setArchivedTasks(tasks);
            }
            else {
                let tasks = _get(DAO, 'tasks', []).filter((t: any) => t.archivedAt !== null && t.deletedAt === null);
                console.log("tasks length : ", tasks.length);
                if (tasks.length === 0) {
                    setTimeout(() => {
                        navigate(`/${DAO.url}`);
                    }, 2000);
                }
                setArchivedTasks(tasks);
            }
        }
    }, [DAO]);

    return (
        <div className="archive-container" style={{ height: 'calc(100vh - 80px)' }}>

            <div className="archive-header">
                <div className="archive-heading-box">
                    <div className="left" onClick={() => navigate(-1)}>
                        <IoIosArrowBack size={20} color="#C94B32" />
                    </div>
                    <div className="right">
                        <p>Archived <span>{transformTask().labelPlural}</span></p>
                    </div>
                </div>
            </div>

            <div className="archive-body" style={{ overflow: 'hidden', height: '80vh', marginTop: 80, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', overflow: 'hidden', overflowY: 'auto' }}>
                    {
                        archivedTasks && archivedTasks.map((item, index) => {
                            return (
                                <div key={index} style={{ marginBottom: '25px' }}>
                                    <TaskCard
                                        task={item}
                                        daoUrl={DAO?.url}
                                    />
                                </div>
                            )
                        })
                    }
                </div>
            </div>

        </div>
    )
}
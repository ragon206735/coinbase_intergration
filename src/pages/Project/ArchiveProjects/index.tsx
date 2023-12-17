import React from "react";
import { find as _find, get as _get, debounce as _debounce } from 'lodash';
import './style.css';
import { useDAO } from "context/dao";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from 'react-icons/io'
import ProjectCard from "components/ProjectCard";
import useTerminology from 'hooks/useTerminology';

export default () => {
    const navigate = useNavigate();
    const { DAO } = useDAO();
    const { transformTask, transformWorkspace } = useTerminology(_get(DAO, 'terminologies', null))
    const daoName = _get(DAO, 'name', '').split(" ");
    return (
        <div className="archive-container" style={{ height: 'calc(100vh - 80px)' }}>

            <div className="archive-header">
                <div className="archive-heading-box">
                    <div className="left" onClick={() => navigate(-1)}>
                        <IoIosArrowBack size={20} color="#C94B32" />
                    </div>
                    <div className="right">
                        <p>Archived <span>{transformWorkspace().labelPlural}</span></p>
                    </div>
                </div>
            </div>

            <div className="archive-body" style={{ overflow: 'hidden', height: '80vh', marginTop: 80, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', overflow: 'hidden', overflowY: 'auto' }}>
                {
                    DAO?.projects.map((item: any, index: number) => {
                        if (item.archivedAt !== null && item.deletedAt === null) {
                            return (
                                <div key={index} style={{ marginBottom: '25px' }}>
                                    <ProjectCard
                                        project={item}
                                        daoUrl={DAO?.url}
                                    />
                                </div>
                            )
                        }
                        else return null
                    })
                }
                </div>
            </div>
        </div>
    )
}
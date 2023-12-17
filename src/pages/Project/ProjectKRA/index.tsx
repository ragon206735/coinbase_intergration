import React from "react";
import { find as _find, get as _get, debounce as _debounce } from 'lodash';
import '../ArchiveProjects/style.css';

import { useDAO } from "context/dao";
import { useAppSelector } from "helpers/useAppSelector";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack, IoIosArrowForward, IoIosArrowDown } from 'react-icons/io'
import useTerminology from 'hooks/useTerminology';

import RangeSlider from 'components/RangeSlider';
import moment from "moment";

export default () => {
    const navigate = useNavigate();
    const { DAO } = useDAO();
    // @ts-ignore
    const { Project } = useAppSelector(store => store.project);
    console.log("Project : ", Project);
    const { transformTask, transformWorkspace } = useTerminology(_get(DAO, 'terminologies', null))
    const daoName = _get(DAO, 'name', '').split(" ");

    const handleAccordion = (index: number) => {
        const panel = document.getElementById(`panel${index}`);
        const arrow = document.getElementById(`arrow${index}`);
        if (panel && arrow) {
            if (panel.style.display === 'flex') {
                panel.style.display = 'none';
                arrow.style.transform = 'rotate(0deg)';
            }
            else {
                panel.style.display = "flex";
                panel.style.flexWrap = "wrap";
                arrow.style.transform = 'rotate(90deg)';
            }
        }
    }

    const renderAverage = (arr: any) => {
        if(arr) {
            let sum = 0;
            for (let i = 0; i < arr.length; i++) {
                sum += arr[i].progress;
            }
    
            return (sum / arr.length).toFixed(2);
        }
        return 0
    }

    return (
        <div className="archive-container" style={{ height: 'calc(100vh - 80px)' }}>

            <div className="archive-header">
                <div className="archive-heading-box">
                    <div className="left" onClick={() => navigate(-1)}>
                        <IoIosArrowBack size={20} color="#C94B32" />
                    </div>
                    <div className="right">
                        <p>Archived <span>Key Results</span></p>
                    </div>
                </div>
            </div>

            <div className="archive-body" style={{ overflow: 'hidden', height: '80vh', marginTop: 80, display: 'flex', flexDirection: 'column' }}>
                <div style={{ overflow: 'hidden', overflowY: 'auto', height: '100%' }}>
                    {
                        _get(Project, 'kra.tracker', []) && _get(Project, 'kra.tracker', []).map((item: any, index: number) => {
                            return (
                                <div className="accordion-wrapper" key={index}>
                                    <button className="accordion" onClick={() => handleAccordion(index)}>
                                        <h1>{moment.unix(item.start).format("MM/DD/YYYY")}</h1>
                                        <div>
                                            <h1>{renderAverage(item.results)}%</h1>
                                            <IoIosArrowForward size={20} color="#76808D" id={`arrow${index}`} />
                                        </div>
                                    </button>
                                    <div className="panel" id={`panel${index}`} style={{ display: 'none' }}>
                                        <>
                                            {
                                                item.results.map((_item: any, _index: number) => {
                                                    return (
                                                        <div className="panel-div" key={_index}>
                                                            <h1>{_item.name}</h1>
                                                            <div className="progress-wrapper">
                                                                <div style={{ flex: 1, maxWidth: 250 }}>
                                                                    <RangeSlider
                                                                        defaultValue={_item.progress}
                                                                        showThumb={false}
                                                                        disabled={true}
                                                                        onChange={({ value, color }: any) => {
                                                                            console.log("hello : ", value, color);
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="progress-text">{_item.progress}% done</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}
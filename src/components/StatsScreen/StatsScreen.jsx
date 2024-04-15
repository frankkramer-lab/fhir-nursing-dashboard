import "./StatsScreen.css";
import MyPieChart from "../Charts/MyPieChart";
import {useContext, useEffect, useReducer, useState} from "react";
import {DataContext} from "../../utils/api";
import Modifiers from "../Modifiers/Modifiers";
import MyBarChart from "../Charts/MyBarChart";
import GroupHeading from "./GroupHeading";
import {BAR, LINE, NUMBER, PIE, STATIONS} from "../../utils/constants";
import MyLineChart from "../Charts/MyLineChart";
import {NumberDisplay} from "../Charts/NumberDisplay";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {getActiveStation, setActiveStation} from "../../utils/globalVars";
import {initCharts} from "../../utils/filterData";

export default function StatsScreen(props) {

    // force update function
    const [, forceUpdate] = useReducer(x => x + 1, {x: 0});
    const [loadingStation, setLoadingStation] = useState(false);
    const [progress, setProgress] = useState(0);
    const [tabValue, setTabValue] = useState(0);
    const [activeChart, setActiveChart] = useState(0);
    const dataContext = useContext(DataContext);
    const [charts, setCharts] = useState(dataContext.charts);
    const [stationCharts, setStationCharts] = useState(dataContext.stationCharts);
    const [currentWorker, setCurrentWorker] = useState(null);


    function UpdateComponent() {
        forceUpdate();
    }

    useEffect(() => {
        loadCharts(getActiveStation());

        return () => {
            if (currentWorker) currentWorker.terminate();
        }
    }, []);

    function changeStation(event) {
        let station = event.target.value;
        loadCharts(station);
    }

    function loadCharts(station) {
        setLoadingStation(true);

        if (currentWorker) {
            console.log("worker terminated");
            currentWorker.terminate();
        }
        const worker = new Worker(new URL('../../workers/calculationWorker.js', import.meta.url));

        worker.addEventListener('message', (e) => {
            const {type, payload} = e.data;
            if (type === 'result') {
                setStationCharts(payload);
                setLoadingStation(false);
                worker.terminate();
            } else if (type === 'progress') {
                setProgress(payload);
            }
        });

        setCurrentWorker(worker);
        worker.postMessage(station);
        setActiveStation(station);
    }

    function renderChartComponent(index, chart) {
        switch (chart.type) {
            case PIE:
                return <MyPieChart key={index} title={chart.title} active={index === activeChart}
                                   data={chart.p.data} onClick={() => setActiveChart(index)}/>;
            case BAR:
                return <MyBarChart key={index} title={chart.title} active={index === activeChart}
                                   data={chart.p.data} onClick={() => setActiveChart(index)}/>;
            case LINE:
                return <MyLineChart key={index} title={chart.title} active={index === activeChart}
                                    data={chart.p.data} onClick={() => setActiveChart(index)}/>
            case NUMBER:
                return <NumberDisplay key={index} title={chart.title} active={index === activeChart}
                                      data={chart.p.data} onClick={() => setActiveChart(index)}/>
            default:
                return null;
        }
    }

    return (
        <>
            <div className={"stats-screen"}>
                <Tabs value={tabValue} onChange={(event, newValue) => setTabValue(newValue)}>
                    <Tab label="Global Charts"/>
                    <Tab label="Station Charts"/>
                </Tabs>
                {tabValue === 0 && (
                    <div className="scroll-container">
                        <div className="charts">
                            <GroupHeading title={"Charts"}/>
                            {charts.map((chart, index) => {
                                return renderChartComponent(index, chart);
                            })}
                            <div className="buffer"></div>
                        </div>
                    </div>
                )}
                {tabValue === 1 && (
                    <div className="scroll-container">
                        <div className={"station-selection"}>
                            <label htmlFor={"stations"}>Station:</label>
                            <select name={"stations"} id={"stations"} defaultValue={getActiveStation()}
                                    onChange={changeStation}>
                                {STATIONS.map((station, index) => {
                                    return <option key={index} value={station}>{station}</option>;
                                })}
                            </select>
                        </div>
                        {loadingStation && (
                            <div className="loading-station">
                                <p>Loading... {progress}%</p>
                            </div>
                        )}
                        {!loadingStation && (
                            <div className="charts">
                                {stationCharts.map((chart, index) => {
                                    return renderChartComponent(index, chart);
                                })}
                                <div className="buffer"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {(!loadingStation || tabValue===0) && (
                <Modifiers key={activeChart + tabValue}
                           updateComponent={UpdateComponent}
                           charts={tabValue === 0 ? charts : stationCharts}
                           activeIndex={activeChart}
                           tabIndex={tabValue}
                />
            )}
        </>
    );
}
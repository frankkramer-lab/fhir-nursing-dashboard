import "./StatsScreen.css";
import MyPieChart from "../Charts/MyPieChart";
import {useContext, useReducer, useState} from "react";
import {DataContext} from "../../utils/api";
import Modifiers from "../Modifiers/Modifiers";
import MyBarChart from "../Charts/MyBarChart";
import GroupHeading from "./GroupHeading";
import {BAR, LINE, NUMBER, PIE} from "../../utils/constants";
import MyLineChart from "../Charts/MyLineChart";
import {NumberDisplay} from "../Charts/NumberDisplay";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

export default function StatsScreen(props) {

    // force update function
    const [, forceUpdate] = useReducer(x => x + 1, {x: 0});
    const [tabValue, setTabValue] = useState(0);
    const [activeChart, setActiveChart] = useState(0);
    const dataContext = useContext(DataContext);
    const [charts, setCharts] = useState(dataContext.charts);
    const [stationCharts, setStationCharts] = useState(dataContext.stationCharts);


    function UpdateComponent() {
        forceUpdate();
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
                        <div className="charts">
                            <GroupHeading title={"Charts"}/>
                            {stationCharts.map((chart, index) => {
                                return renderChartComponent(index, chart);
                            })}
                            <div className="buffer"></div>
                        </div>
                    </div>
                )}
            </div>
            <Modifiers key={activeChart} updateComponent={UpdateComponent} charts={charts} activeIndex={activeChart}/>
        </>
    );
}
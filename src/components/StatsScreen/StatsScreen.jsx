import "./StatsScreen.css";
import MyPieChart from "../Charts/MyPieChart";
import {useContext, useEffect, useReducer, useState} from "react";
import {DataContext} from "../../utils/api";
import Modifiers from "../Modifiers/Modifiers";
import MyBarChart from "../Charts/MyBarChart";
import GroupHeading from "./GroupHeading";
import {BAR, LINE, PIE} from "../../utils/constants";
import MyLineChart from "../Charts/MyLineChart";

export default function StatsScreen(props) {

    // force update function
    const [, forceUpdate] = useReducer(x => x + 1, {x: 0});
    const [activeChart, setActiveChart] = useState(0);
    const dataContext = useContext(DataContext);
    const [charts, setCharts] = useState(dataContext.charts);


    function UpdateComponent() {
        forceUpdate();
    }


    return (
        <>
            <div className="scroll-container">
                <div className="charts">
                    {/*<TestApi/>*/}
                    <GroupHeading title={"Charts"}/>
                    {charts.map((chart, index) => {
                        if (chart.type === PIE) {
                            return (
                                <MyPieChart key={index} title={chart.title} active={index === activeChart}
                                            data={chart.modifiedData} onClick={() => setActiveChart(index)}/>
                            );
                        }
                        if (chart.type === BAR) {
                            return (
                                <MyBarChart key={index} title={chart.title} active={index === activeChart}
                                            data={chart.modifiedData} onClick={() => setActiveChart(index)}/>
                            );
                        }
                        if (chart.type === LINE) {
                            return (
                                <MyLineChart key={index} title={chart.title} active={index === activeChart}
                                             data={chart.modifiedData} onClick={() => setActiveChart(index)}/>
                            );
                        }
                    })}
                </div>
            </div>
            <Modifiers updateComponent={UpdateComponent} charts={charts} activeIndex={activeChart}/>
        </>
    );
}
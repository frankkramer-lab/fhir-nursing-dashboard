import "./StatsScreen.css";
import MyPieChart from "../Charts/MyPieChart";
import {useContext, useState} from "react";
import {DataContext} from "../../utils/api";
import Modifiers from "./Modifiers";
import MyBarChart from "../Charts/MyBarChart";
import GroupHeading from "./GroupHeading";
import {initCharts} from "../../utils/filterData";
import {BAR, PIE} from "../../utils/constants";

export default function StatsScreen(props) {

    const [activeChart, setActiveChart] = useState(0);
    const dataContext = useContext(DataContext);


    const charts = initCharts(dataContext);
    console.log(charts);

    return (
        <>
            <div className="scroll-container">
                <div className="charts">
                    {/*<TestApi/>*/}
                    <GroupHeading title={"Pie Charts"}/>
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
                    })}
                </div>
            </div>
            <Modifiers text={"Modifier für: " + charts[activeChart].title}/>
        </>
    );
}
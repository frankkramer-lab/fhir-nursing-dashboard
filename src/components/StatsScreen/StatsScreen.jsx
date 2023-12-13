import "./StatsScreen.css";
import TestApi from "../testApi";
import MyPieChart from "../Charts/MyPieChart";
import {charts01, charts05} from "../../utils/constants";
import {useState} from "react";
import Modifiers from "./Modifiers";

export default function StatsScreen(props) {

    const [activeChart, setActiveChart] = useState(0);

    const data = {
        labels: [
            'male',
            'female',
        ],
        datasets: [{
            data: [20, 40],
            backgroundColor: [
                charts05,
                charts01,
            ]
        }]
    };


    const charts = [
        {
            title: "Geschlecht",
            data: data,
        },
        {
            title: "Alter",
            data: data,
        },
        {
            title: "Test",
            data: data,
        },
        {
            title: "Test2",
            data: data,
        },
        {
            title: "Test3",
            data: data,
        },
        {
            title: "Geschlecht test",
            data: data,
        },
        {
            title: "Langer Titel und Seite überfüllt chart test",
            data: data,
        },
    ];

    return (
        <>
            <div className="scroll-container">
                <div className="charts">
                    {/*<TestApi/>*/}
                    {charts.map((chart, index) => (
                        <div onClick={() => setActiveChart(index)}>
                            <MyPieChart key={index} title={chart.title} active={index === activeChart}
                                        data={chart.data}/>
                        </div>
                    ))}
                </div>
            </div>
            <Modifiers text={"Modifier für: " + charts[activeChart].title}/>
        </>
    );
}
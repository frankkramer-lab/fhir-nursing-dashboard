import "./StatsScreen.css";
import MyPieChart from "../Charts/MyPieChart";
import {useContext, useState} from "react";
import {DataContext} from "../../utils/api";
import Modifiers from "./Modifiers";
import MyBarChart from "../Charts/MyBarChart";
import GroupHeading from "./GroupHeading";

export default function StatsScreen(props) {

    const [activeChart, setActiveChart] = useState(0);
    const dataContext = useContext(DataContext);

    const data = {
        labels: [
            'male',
            'female',
        ],
        datasets: [{
            data: [
                dataContext.patients.filter(p => p.gender === 'male').length,
                dataContext.patients.filter(p => p.gender === 'female').length,
            ],

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
                    <GroupHeading title={"Pie Charts"}/>
                    {charts.map((chart, index) => (
                        <MyPieChart key={index} title={chart.title} active={index === activeChart}
                                    data={chart.data} onClick={() => setActiveChart(index)}/>
                    ))}
                    <GroupHeading title={"Patienten Daten"}/>
                    <MyBarChart key={112} title={'bar'} active={false} onClick={null}/>
                    <MyPieChart key={113} title={charts[0].title} active={113 === activeChart}
                                data={charts[0].data} onClick={null}/>
                </div>
            </div>
            <Modifiers text={"Modifier für: " + charts[activeChart].title}/>
        </>
    );
}
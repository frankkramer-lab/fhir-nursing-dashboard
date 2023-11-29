import "./testDiagram.css";
import {Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title} from 'chart.js';
import {Bar} from "react-chartjs-2";
import {charts01, charts05} from "../utils/constants";
import ChartContainer from "./ChartContainer";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    responsive: true,
    plugins: {
        legend: {
            display: false,
        },
    },
};

export default function TestChart(props) {

    const labels = props.labels.map(l => l.slice(0, 3)); // string array []

    const data = {
        labels: labels,
        datasets: [
            {
                label: "Male",
                data: props.male, // number array []
                backgroundColor: charts05,
            },
            {
                label: "Female",
                data: props.female, // number array []
                backgroundColor: charts01,
            },
        ]
    };

    return (
        <>
            <ChartContainer title={"Test Chart"} active={false}>
                <div className="diagram">
                    <Bar options={options} data={data}/>
                </div>
            </ChartContainer>
        </>
    );
}
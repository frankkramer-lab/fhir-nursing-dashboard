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
    scales: {
        x: {
            ticks: {
                callback: function (value) {
                    if (value.length > 4) {
                        return value.substring(0, 4) + '...'; //truncate
                    } else {
                        return value
                    }

                },
            }
        },
        y: {}
    },
    tooltips: {
        enabled: true,
        mode: 'label',
        callbacks: {
            title: function (tooltipItems, data) {
                let idx = tooltipItems[0].index;
                return data.labels[idx]; //do something with title
            },
            label: function (tooltipItems, data) {
                return tooltipItems.xLabels;
            }
        }
    },
};

export default function TestChart(props) {// string array []

    const data = {
        labels: props.labels,
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
                <Bar options={options} data={data}/>
            </ChartContainer>
        </>
    );
}
import './charts.css';
import ChartContainer from "../ChartContainer";
import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {getColorArray, addAlpha} from "../../utils/colorHelper";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function MyLineChart(props) {

    const colors = getColorArray(props.data.datasets.length);

    for (let i = 0; i < props.data.datasets.length; i++) {
        props.data.datasets[i].backgroundColor = colors[i];
        props.data.datasets[i].borderColor = addAlpha(colors[i], 0.6);
    }

    // Konfiguration für den Line-Chart
    const options = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <ChartContainer title={props.title} active={props.active} onClick={props.onClick} columns={2}>
            <div className={'bar'}>
                <Line data={props.data} options={options}/>
            </div>
        </ChartContainer>
    );
};

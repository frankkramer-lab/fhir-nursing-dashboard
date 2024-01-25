import './charts.css';
import {charts05} from "../../utils/constants";
import ChartContainer from "../ChartContainer";
import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import {getColorArray} from "../../utils/colorHelper";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function MyBarChart(props) {

    const colors = getColorArray(props.data.datasets.length);

    for (let i = 0; i < props.data.datasets.length; i++) {
        props.data.datasets[i].backgroundColor = colors[i];
    }

    // Konfiguration für den Bar-Chart
    const options = {
        scales: {
            x: {
                type: 'category',
                labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4'],
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <ChartContainer title={props.title} active={props.active} onClick={props.onClick} columns={2}>
            <div className={'bar'}>
                <Bar data={props.data} />
            </div>
        </ChartContainer>
    );
};

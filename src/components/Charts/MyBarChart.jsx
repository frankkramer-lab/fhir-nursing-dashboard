import './charts.css';
import React from 'react';
import {Bar} from 'react-chartjs-2';
import ChartContainer from "../ChartContainer";

export default function MyBarChart(props) {
    // Daten für den Bar-Chart
    const data = {
        labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4'],
        datasets: [
            {
                label: 'Series 1',
                data: [10, 15, 25, 30],
                backgroundColor: 'rgba(75,192,192,1)',
                borderColor: 'rgba(0,0,0,1)',
                borderWidth: 1,
            },
        ],
    };

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
                <Bar data={data} options={options}/>
            </div>
        </ChartContainer>
    );
};

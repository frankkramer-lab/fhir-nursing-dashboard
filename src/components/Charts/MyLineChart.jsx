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
import {Line} from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import {getColorArray, addAlpha} from "../../utils/colorHelper";

ChartJS.register(
    CategoryScale,
    LinearScale,
    LineElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    annotationPlugin
);

export default function MyLineChart(props) {

    const colors = getColorArray(props.data.datasets.length);

    for (let i = 0; i < props.data.datasets.length; i++) {
        props.data.datasets[i].backgroundColor = colors[i];
        props.data.datasets[i].borderColor = addAlpha(colors[i], 0.6);
    }

    let annotations


    if (props.data.datasets.length > 0) {
        annotations = Object.keys(props.data.datasets[0].data).map((value, index) => {
            if (value.split('.')[0] === '01')
                return {
                    type: 'line',
                    mode: 'vertical',
                    scaleID: 'x',
                    value: value,
                    borderColor: 'purple',
                    borderWidth: 1,
                    label: {
                        enabled: true,
                        content: 'New Month'
                    }
                };
            else return null;
        });
        annotations = annotations.filter(item => item !== null);
    }else{
        annotations = [];
    }

    // Konfiguration für den Line-Chart
    const options = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
        plugins: {
            annotation: {
                drawTime: 'afterDatasetsDraw',
                annotations: annotations
            }
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

import "./testDiagram.css";
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js';
import {Pie} from "react-chartjs-2";
import {charts01, charts05} from "../utils/constants";
import ChartContainer from "./ChartContainer";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function TestDiagram(props) {

    const data = {
        labels: [
            'male',
            'female'
        ],
        datasets: [{
            data: [props.male, props.female],
            backgroundColor: [
                charts05,
                charts01,
            ]
        }]
    };

    return (
        <>
            <ChartContainer title={"Geschlecht"} active={true}>
                <div className="diagram">
                    <Pie data={data}/>
                    <p>Male: {((props.male / (props.male + props.female)) * 100).toFixed(1)}%</p>
                    <p>Female: {((props.female / (props.male + props.female)) * 100).toFixed(1)}%</p>
                </div>
            </ChartContainer>

        </>
    );
}
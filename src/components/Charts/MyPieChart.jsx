import './charts.css';
import ChartContainer from "../ChartContainer";
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js';
import {Pie} from 'react-chartjs-2';
import {getColorArray} from "../../utils/colorHelper";

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * @return {JSX.Element}
 * @constructor
 * @param {boolean} props.active if container should show active state
 * @param {string} props.title title of the chart
 * @param {object} props.data data for the chart
 */
export default function MyPieChart(props) {

    props.data.datasets[0].backgroundColor = getColorArray(props.data.datasets[0].data.length);

    /*const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            }
        }
    };*/

    return (

        <ChartContainer title={props.title} active={props.active} onClick={props.onClick}>
            <div className={'pie'}>
                <Pie data={props.data}/>
            </div>
        </ChartContainer>

    );
}
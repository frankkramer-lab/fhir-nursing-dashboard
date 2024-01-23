import './charts.css';
import ChartContainer from "../ChartContainer";
import {Pie} from "react-chartjs-2";

/**
 * @return {JSX.Element}
 * @constructor
 * @param {boolean} props.active if container should show active state
 * @param {string} props.title title of the chart
 * @param {object} props.data data for the chart
 */
export default function MyPieChart(props) {

    return (

        <ChartContainer title={props.title} active={props.active} onClick={props.onClick}>
            <div className={'pie'}>
                <Pie data={props.data}/>
            </div>
        </ChartContainer>

    );
}
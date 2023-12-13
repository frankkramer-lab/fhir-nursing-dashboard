import ChartContainer from "../ChartContainer";
import {Pie} from "react-chartjs-2";

/**
 * @return {JSX.Element}
 * @constructor
 * @param active boolean - if container should show active state
 * @param title string - title of the chart
 * @param data object - data for the chart
 */
export default function MyPieChart(props) {

    return (
        <>
            <ChartContainer title={props.title} active={props.active}>
                <div className="diagram">
                    <Pie data={props.data}/>
                </div>
            </ChartContainer>
        </>
    );
}
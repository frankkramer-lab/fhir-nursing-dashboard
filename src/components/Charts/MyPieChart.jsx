import './charts.css';
import ChartContainer from "../ChartContainer";
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js';
import {getElementAtEvent, Pie} from 'react-chartjs-2';
import {getColorArray} from "../../utils/colorHelper";
import {useRef, useState} from "react";
import {DetailsDialog} from "../Modals/DetailsDialog";

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * @return {JSX.Element}
 * @constructor
 * @param {boolean} props.active if container should show active state
 * @param {string} props.title title of the chart
 * @param {object} props.data data for the chart
 */
export default function MyPieChart(props) {
    const chartRef = useRef();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [details, setDetails] = useState("");

    props.data.datasets[0].backgroundColor = getColorArray(props.data.datasets[0].data.length);


    const openDialog = (event) => {
        if (props.data.datasets[0].details) {
            if (getElementAtEvent(chartRef.current, event).length === 0) return;
            let dataIndex = getElementAtEvent(chartRef.current, event)[0].index;
            let detailsText = props.data.datasets[0].details[dataIndex];
            setDetails(detailsText + ": " + props.data.datasets[0].data[dataIndex])
            setDialogOpen(true);
        }
    }

    return (

        <ChartContainer title={props.title} active={props.active} onClick={props.onClick}>
            <div className={'pie'}>
                <Pie data={props.data} onClick={openDialog} ref={chartRef}/>
            </div>
            <DetailsDialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                title={"Details"}
                details={details}
            />
        </ChartContainer>
    );
}
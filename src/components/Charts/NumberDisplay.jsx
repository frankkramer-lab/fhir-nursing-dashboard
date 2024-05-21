import ChartContainer from "../ChartContainer";
import './charts.css';
import {getElementAtEvent} from "react-chartjs-2";
import {DetailsDialog} from "../Modals/DetailsDialog";
import {useState} from "react";

export function NumberDisplay(props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [details, setDetails] = useState("");


    const openDialog = (event) => {
        if (props.data.details) {
            setDetails(props.data.number.toFixed(2) + props.data.unit + ": " + props.data.details)
            setDialogOpen(true);
        }
    }


    return (
        <ChartContainer title={props.title} active={props.active} onClick={props.onClick} columns={1}>
            <div className="number-display">
                <h2>{props.title}</h2>
                <h1 onClick={openDialog}>{props.data.number.toFixed(2)}{props.data.unit}</h1>
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
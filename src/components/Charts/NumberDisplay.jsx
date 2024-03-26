import ChartContainer from "../ChartContainer";
import './charts.css';

export function NumberDisplay(props) {

    return (
        <ChartContainer title={props.title} active={props.active} onClick={props.onClick} columns={1}>
            <div className="number-display">
                <h2>{props.title}</h2>
                <h1>{props.data.number.toFixed(2)}{props.data.unit}</h1>
            </div>
        </ChartContainer>
    );
}
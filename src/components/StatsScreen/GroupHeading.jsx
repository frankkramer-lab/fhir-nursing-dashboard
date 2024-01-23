export default function GroupHeading(props) {
    return (
        <div style={{gridColumn: 'span 3'}}>
            <h1>{props.title}</h1>
        </div>
    );
}
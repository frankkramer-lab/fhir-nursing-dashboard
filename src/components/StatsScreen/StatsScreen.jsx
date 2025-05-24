import React, {useContext, useEffect, useReducer, useState} from "react";

import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import "./StatsScreen.css";
import MyPieChart from "../Charts/MyPieChart";
import MyBarChart from "../Charts/MyBarChart";
import {BAR, LINE, NUMBER, PIE} from "../../utils/constants";
import MyLineChart from "../Charts/MyLineChart";
import {NumberDisplay} from "../Charts/NumberDisplay";

import {GenderPieChartID, initCharts} from "../../utils/init_charts";
import DBMetaContext from "../../context/DbMetaContext";
import activeParentOrgContext from "../../context/ActiveParentOrgContext";
import {
    chart_group_headlines,
    chart_tab_processors_mapping,
    data_processor_chart_group_mapping,
    FACHABTEILUNG_CHARTS_TAB_VALUE,
    GLOBAL_CHARTS_TAB_VALUE,
    STATION_CHARTS_TAB_VALUE,
} from "../../utils/config";
import Modifiers from "../Modifiers/Modifiers";
import Box from "@mui/material/Box";
import {Divider, Stack} from "@mui/material";

export default function StatsScreen() {
    const [dbMeta,] = useContext(DBMetaContext);

    const [, forceUpdate] = useReducer(x => x + 1, {x: 0});  // force update function
    const [tabValue, setTabValue] = useState(GLOBAL_CHARTS_TAB_VALUE);
    const [activeChart, setActiveChart] = useState(GenderPieChartID);

    const [activeParentOrgMeta, dispatchActiveParentOrgMeta] = useContext(activeParentOrgContext);

    // parent Organization:
    const [globalCharts, setGlobalCharts] = useState(null);
    const [loadingGlobalCharts, setLoadingGlobalCharts] = useState(true);

    // Fachabteilung:
    const [faCharts, setFaCharts] = useState(null);
    const [loadingFaCharts, setLoadingFaCharts] = useState(true);

    // station:
    const [stationCharts, setStationCharts] = useState(null);
    const [loadingStationCharts, setLoadingStationCharts] = useState(true);

    function UpdateComponent() {
        forceUpdate();
    }

    useEffect(() => {
        async function init() {
            const db_name = dbMeta.org_db_mapping[activeParentOrgMeta.activeParentOrg];
            setGlobalCharts(await initCharts(db_name, chart_tab_processors_mapping[GLOBAL_CHARTS_TAB_VALUE]));

            setLoadingGlobalCharts(false);
        }

        init().then();
    }, [activeParentOrgMeta.activeParentOrg]);

    useEffect(() => {
        async function init() {
            const db_name = dbMeta.org_db_mapping[activeParentOrgMeta.activeParentOrg];
            setFaCharts(await initCharts(db_name, chart_tab_processors_mapping[FACHABTEILUNG_CHARTS_TAB_VALUE], 'fa', activeParentOrgMeta.activeFa));
            setLoadingFaCharts(false);
        }

        init().then();
    }, [activeParentOrgMeta.activeFa]);

    useEffect(() => {
        async function init() {
            const db_name = dbMeta.org_db_mapping[activeParentOrgMeta.activeParentOrg];
            setStationCharts(await initCharts(db_name, chart_tab_processors_mapping[STATION_CHARTS_TAB_VALUE], 'station', activeParentOrgMeta.activeStation));
            setLoadingStationCharts(false);
        }

        init().then();
    }, [activeParentOrgMeta.activeStation]);

    function handleActiveFaChange(event) {
        console.log('handle active fa change');
        console.log(event.target);
        setLoadingFaCharts(true);
        dispatchActiveParentOrgMeta({
            type: 'set_fa', payload: {
                fa: event.target.value,
            }
        });
    }

    function handleActiveStationChange(event) {
        console.log('handle active station change');
        console.log(event.target);
        setLoadingStationCharts(true);
        dispatchActiveParentOrgMeta({
            type: 'set_station', payload: {
                station: event.target.value,
            }
        })
    }

    // console.log('global', loadingGlobalCharts, globalCharts);
    // console.log('fa', loadingFaCharts, faCharts);
    // console.log('station', loadingStationCharts, stationCharts);

    function renderChartComponent(index, chart) {
        // console.log('StatsScreen, rendering chart component: ', index, chart);

        switch (chart.type) {
            case PIE:
                return <MyPieChart key={index} title={chart.title} active={index === activeChart}
                                   data={chart.p.data} onClick={() => setActiveChart(index)}/>;
            case BAR:
                return <MyBarChart key={index} title={chart.title} active={index === activeChart}
                                   data={chart.p.data} onClick={() => setActiveChart(index)}/>;
            case LINE:
                return <MyLineChart key={index} title={chart.title} active={index === activeChart}
                                    data={chart.p.data} onClick={() => setActiveChart(index)}/>
            case NUMBER:
                return <NumberDisplay key={index} title={chart.title} active={index === activeChart}
                                      data={chart.p.data} onClick={() => setActiveChart(index)}/>
            default:
                return null;
        }
    }

    function renderCharts(charts) {
        let rendered_charts_groups = [];

        for (const [chart_group_index, chart_group_data_processors] of Object.entries(data_processor_chart_group_mapping)) {
            // console.log("Rendering chart groups: ", chart_group_index, chart_group_data_processors);

            const charts_of_this_group = [];
            for (const chart_group_data_processor of chart_group_data_processors) {
                for (const chart of charts) {
                    // console.log("Rendering chart groups: ", chart, chart_group_data_processor);
                    if (chart.p instanceof chart_group_data_processor) {
                        charts_of_this_group.push(chart);
                    }
                }
            }

            // console.log("StatsScreen, rendering chart groups: ", charts_of_this_group);
            const rendered_charts = charts_of_this_group.map((chart, _) => {
                return renderChartComponent(chart.id, chart);
            });
            // console.log('StatsScreen, rendering chart groups, rendered charts: ', rendered_charts);

            rendered_charts_groups.push(<div key={chart_group_index}>
                <h2>
                    {chart_group_headlines[chart_group_index]}
                </h2>
                <div key={chart_group_index} className={"charts"}>
                    {rendered_charts}
                </div>
            </div>);
        }

        // console.log('StatsScreen, rendering chart groups, rendered: ', rendered_charts_groups);

        const ret = (<Stack
            direction="column"
            divider={<Divider orientation="horizontal" flexItem/>}
            spacing={1}
        >
            {rendered_charts_groups}
        </Stack>)

        // console.log('StatsScreen, rendering chart groups, result: ', ret);

        return ret;
    }

    if (!activeParentOrgMeta) {
        return (<Box>
            Loading...
        </Box>)
    }

    // console.log(activeParentOrgMeta);
    // console.log('global charts: ', globalCharts);
    // console.log('fa charts: ', faCharts);
    // console.log('station charts', stationCharts);
    // console.log('StatsScreen, tab value: ', tabValue);

    const select_fa_values = dbMeta.org_fa_mapping[activeParentOrgMeta.activeParentOrg].map((fa, i) => (
        <MenuItem value={fa} key={i}>{dbMeta.fas[fa].name}</MenuItem>));

    const select_station_values = dbMeta.org_station_mapping[activeParentOrgMeta.activeParentOrg].map((station, i) => (
        <MenuItem value={station} key={i}>{dbMeta.stations[station].name}</MenuItem>));

    return (<>
        <div className={"stats-screen"}>
            <Tabs value={tabValue} onChange={(event, newValue) => {
                setActiveChart(0);
                setTabValue(newValue)
            }}>
                <Tab label="Global Charts"/>
                <Tab label="Fachabteilung Charts"/>
                <Tab label="Station Charts"/>
            </Tabs>
            {tabValue === GLOBAL_CHARTS_TAB_VALUE && (<div className="scroll-container">
                {loadingGlobalCharts && (<div className="loading">
                    <p>Loading...</p>
                </div>)}
                {!loadingGlobalCharts && (<>
                    {renderCharts(globalCharts, GLOBAL_CHARTS_TAB_VALUE)}
                </>)}
            </div>)}
            {tabValue === FACHABTEILUNG_CHARTS_TAB_VALUE && (<div className="scroll-container">
                <FormControl fullWidth>
                    <InputLabel id="select-label" sx={{padding: '10px'}}>Fachabteilung</InputLabel>
                    <Select
                        labelId="select-active-fa-label"
                        id="select-active-fa"
                        value={activeParentOrgMeta.activeFa}
                        label='select-active-fa'
                        onChange={handleActiveFaChange}
                        variant='standard'
                        sx={{margin: '10px'}}>
                        {select_fa_values}
                    </Select>
                </FormControl>
                {loadingFaCharts && (<div className="loading">
                    <p>Loading...</p>
                </div>)}
                {!loadingFaCharts && (<>
                    {renderCharts(faCharts, FACHABTEILUNG_CHARTS_TAB_VALUE)}
                </>)}
            </div>)}
            {tabValue === STATION_CHARTS_TAB_VALUE && (<div className="scroll-container">
                <FormControl fullWidth>
                    <InputLabel id="select-label" sx={{padding: '10px'}}>Station</InputLabel>
                    <Select
                        labelId="select-active-station-label"
                        id="select-active-station"
                        value={activeParentOrgMeta.activeStation}
                        label='select-active-station'
                        onChange={handleActiveStationChange}
                        variant='standard'
                        sx={{margin: '10px'}}>
                        {select_station_values}
                    </Select>
                </FormControl>
                {loadingStationCharts && (<div className="loading">
                    <p>Loading...</p>
                </div>)}
                {!loadingStationCharts && (<>
                    {renderCharts(stationCharts, STATION_CHARTS_TAB_VALUE)}
                </>)}
            </div>)}
        </div>
        {(tabValue === GLOBAL_CHARTS_TAB_VALUE && !loadingGlobalCharts && globalCharts.length !== 0) && (<Modifiers key={activeChart}
                                                                                       updateComponent={UpdateComponent}
                                                                                       charts={globalCharts}
                                                                                       activeIndex={activeChart}
                                                                                       tabIndex={tabValue}
        />)}
        {(tabValue === FACHABTEILUNG_CHARTS_TAB_VALUE && !loadingFaCharts && faCharts.length !== 0) && (
            <Modifiers key={activeChart}
                       updateComponent={UpdateComponent}
                       charts={faCharts}
                       activeIndex={activeChart}
                       tabIndex={tabValue}
            />)}
        {(tabValue === STATION_CHARTS_TAB_VALUE && !loadingStationCharts && stationCharts.length !== 0) && (
            <Modifiers key={activeChart}
                       updateComponent={UpdateComponent}
                       charts={stationCharts}
                       activeIndex={activeChart}
                       tabIndex={tabValue}
            />)}
    </>);
}
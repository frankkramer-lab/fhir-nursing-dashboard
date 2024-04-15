/* eslint-env worker */
/* eslint-disable no-restricted-globals */

import {initCharts} from "../utils/filterData";

self.addEventListener('message', async function (e) {
    const {data} = e;
    console.log('Calculation-Worker received message:', data);
    self.postMessage({type: 'progress', payload: 0});

    // Hier die aufwendige Berechnung durchführen
    const result = await performComplexCalculation(data);

    // Ergebnis an den Hauptthread senden
    self.postMessage({type: 'result', payload: result});
});

async function performComplexCalculation(station) {
    return await initCharts((p) => {
        self.postMessage({type: 'progress', payload: p});
    }, station);
}

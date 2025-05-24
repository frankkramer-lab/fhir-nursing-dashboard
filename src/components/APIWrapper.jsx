import React, {useContext, useEffect, useState} from 'react';
import DbMetaContext from "../context/DbMetaContext";
import Box from "@mui/material/Box";

import {loadAndInitOrgDatabases, loadResourcesOfType} from '../utils/load_resources';

export const APIWrapper = ({children}) => {
    const [dbMeta, setDbMeta] = useContext(DbMetaContext);

    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [errorWhileLoading, setErrorWhileLoading] = useState(false);

    function updateProgress(p) {
        if (p > progress) {
            setProgress(p);
        }
    }

    useEffect(() => {
        async function init() {
            let db_meta_temp = {}
            try {

                setLoading(true);
                // console.log('Loading FHIR resources.');

                // load parent org, each first level org (krankenhaus) saved in own db:
                await loadAndInitOrgDatabases(db_meta_temp, updateProgress, 'https://gematik.de/fhir/isik/StructureDefinition/ISiKOrganisation');

                // console.log('Loading parent orgs finished.')
                // console.log(db_meta_temp);

                // load Fachachbteilungen (fas):
                await loadResourcesOfType(db_meta_temp, 'Organization', 'https://gematik.de/fhir/isik/StructureDefinition/ISiKOrganisationFachabteilung', updateProgress);

                // load stationen after fas (needs fa info for parent org (-> fa) -> station mapping):
                await loadResourcesOfType(db_meta_temp, 'Location', 'https://gematik.de/fhir/isik/StructureDefinition/ISiKStandort', updateProgress);

                // load encounter data:
                await Promise.all([
                    loadResourcesOfType(db_meta_temp, 'Encounter', 'https://www.medizininformatik-initiative.de/fhir/core/modul-fall/StructureDefinition/KontaktGesundheitseinrichtung', updateProgress),
                    loadResourcesOfType(db_meta_temp, 'Encounter', 'https://gematik.de/fhir/isip/v1/Basismodul/StructureDefinition/ISiPPflegeepisode', updateProgress),
                ]);


                // load patient data:
                await loadResourcesOfType(db_meta_temp, 'Patient', 'https://gematik.de/fhir/isip/v1/Basismodul/StructureDefinition/ISiPPflegeempfaenger', updateProgress);
                // console.log('Loading patients finished.');

                // load other resources:
                await Promise.all([
                    loadResourcesOfType(db_meta_temp, 'Procedure', 'https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Procedure_Nursing_Measures', updateProgress),
                    loadResourcesOfType(db_meta_temp, 'Condition', 'https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Condition_Care_Problem', updateProgress),
                    loadResourcesOfType(db_meta_temp, 'Condition', 'https://gematik.de/fhir/isik/StructureDefinition/ISiKDiagnose', updateProgress),
                    loadResourcesOfType(db_meta_temp, 'Observation', 'https://fhir.kbv.de/StructureDefinition/KBV_PR_MIO_ULB_Observation_Respiratory_Support', updateProgress),
                ]);

                console.log('Loading resources finished.');
                console.log(db_meta_temp);

            } catch (e) {
                console.error(e);
                setErrorWhileLoading(true);
                return;
            }

            setDbMeta(db_meta_temp);
            setErrorWhileLoading(false);
            setLoading(false);
            setProgress(0);
        }

        init().then();
    }, []);

    if (errorWhileLoading) {
        return (<Box sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '100vh'
        }}>
            Error while loading FHIR resources.
        </Box>);
    }

    if (loading) {
        return (<Box sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '100vh'
        }}>
            <p>Loading... {progress.toFixed(0)}%</p>
        </Box>);
    }

    if (Object.keys(dbMeta.org_db_mapping).length === 0) {
        return (<Box sx={{
            display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '100vh'
        }}>
            No orgs found.
        </Box>);
    }

    return (<Box>
        {children}
    </Box>);
};
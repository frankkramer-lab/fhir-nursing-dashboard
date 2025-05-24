import os
import glob
import json
from json import JSONDecodeError
from typing import AnyStr

FHIR_RESOURCES_BASE_URL: str = './fhir_resources'

def retrieve_all_resources_of_type_as_bundle(fhir_type: str, bundle_base_url: str, profile_resource_name: str = '') -> dict:
    print(f'Retrieving all resources of {fhir_type=} and {profile_resource_name=} from {FHIR_RESOURCES_BASE_URL}.')

    # use fhir type as parent folder name and profile resource name (if specified) as subfolder name
    pathname: str = os.path.join(FHIR_RESOURCES_BASE_URL, fhir_type, profile_resource_name, '*.json')
    print(f'{pathname=}')
    files = glob.glob(pathname=pathname)
    #print(f'{files=}')

    res_bundle: dict = {
        'resourceType': 'Bundle',
        'id': '',
        'type': 'searchset',
        'total': 1,
        'link': [
            {
                'relation': 'self',
                'url': f'{os.path.join(bundle_base_url, fhir_type)}'
            }
        ],
        'entry': []
    }

    bundle_total_count: int = 0

    file: AnyStr = ''
    try:
        for file in files:
            with open(file, 'r') as f:
                curr_bundle: dict = json.load(f)
                #print(f'{curr_bundle=}')

                # sum up total count of all bundles
                bundle_total_count += curr_bundle['total']

                # add bundle entries of current bundles to resulting bundle
                res_bundle['entry'].extend(curr_bundle['entry'])

        res_bundle['total'] = bundle_total_count  # set summed up total of all bundles

        #print(f'Resulting bundle {res_bundle}.')

        return res_bundle

    # if file not a valid json / expected key not present, return dict with error information
    except JSONDecodeError as e:
        return {'error': f'Error in file {file}: {e}]'}
    except KeyError as e:
        return {'error': f'Error in file {file}: Key {e} expected but not found.'}

if __name__ == '__main__':
    BUNDLE_BASE_URL: str = 'http://localhost:8080/fhir-server/api/v4/'

    bundle: dict = retrieve_all_resources_of_type_as_bundle('Organization', bundle_base_url=BUNDLE_BASE_URL, profile_resource_name='ISiKOrganisation')
    bundle_json: str = json.dumps(bundle, indent=4)
    print(bundle_json)
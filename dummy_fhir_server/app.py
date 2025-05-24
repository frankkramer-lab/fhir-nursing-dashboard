from flask import Flask, jsonify, request

from retrieve_resources import retrieve_all_resources_of_type_as_bundle

app = Flask(__name__)
flask_base_url: str = '/fhir-server/api/v4'

BUNDLE_BASE_URL: str = 'http://localhost:8080/fhir-server/api/v4/'

@app.route(flask_base_url + '/<fhir_type>', methods=['GET'])
def get_resources(fhir_type: str):
    profile_arg = request.args.get('_profile')
    print(f'{profile_arg=}')
    if profile_arg is None:
        return jsonify(retrieve_all_resources_of_type_as_bundle(fhir_type=fhir_type, bundle_base_url=BUNDLE_BASE_URL))
    else:
        return jsonify(retrieve_all_resources_of_type_as_bundle(fhir_type=fhir_type, bundle_base_url=BUNDLE_BASE_URL,
                                                                profile_resource_name=profile_arg.split('/')[-1]))

if __name__ == '__main__':
    @app.after_request
    def after_request(response):
        header = response.headers
        header['Access-Control-Allow-Origin'] = '*'
        header['Access-Control-Allow-Methods'] = '*'
        header['Access-Control-Allow-Headers'] = '*'
        return response

    app.run(host='0.0.0.0', port=8080)


#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR" || exit

if [ ! -d "app_env" ]; then
    python3 -m venv "app_env"
    source "app_env/bin/activate"
    python3 -m pip install -U setuptools wheel
    python3 -m pip install -r dummy_fhir_server/requirements.txt
else
    source "app_env/bin/activate"
fi

cd ./dummy_fhir_server || exit
lsof -i :8080
#if [ ! -z $1 ] && [ $1 = "nocors" ]; then
    #FLASK_DEBUG=1 python3 app.py
#else
    #exec gunicorn -w 2 -b 0.0.0.0:5000 wsgi:app
#fi
python3 app.py
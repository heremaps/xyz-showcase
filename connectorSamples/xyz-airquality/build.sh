#!/bin/bash
cd src
pip3 install -r requirements.txt -t . --upgrade
zip -r ./../deployment.zip .

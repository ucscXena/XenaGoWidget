#!/bin/bash
rm -f demo.tgz
npm run-script build:demo
#ssh -i ~/.ssh/nathan-lbl-laptop-2018.pem ubuntu@xenademo.berkeleybop.io ./clean_xena.sh
tar cvfz demo.tgz demo
#scp -i ~/.ssh/nathan-lbl-laptop-2018.pem ucsc-xena-geneset-*.tgz ubuntu@xenademo.berkeleybop.io:
scp -i ~/.ssh/nathan-lbl-laptop-2018.pem demo.tgz ubuntu@xenademo.berkeleybop.io:
ssh -i ~/.ssh/nathan-lbl-laptop-2018.pem ubuntu@xenademo.berkeleybop.io ./update_xena.sh



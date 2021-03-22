FROM ubuntu:20.04

RUN apt-get -qq update --fix-missing && \
	apt-get --no-install-recommends -y install \
	nginx nodejs npm

RUN rm -fr /var/www/html/xena

WORKDIR /usr/src/app
COPY src ./src
COPY demo ./demo
COPY package.* .
COPY *.nwb.config.js .
RUN npm install
RUN npm run build:demo

RUN mv demo/dist /var/www/html/xena
RUN service nginx start
EXPOSE 80
CMD ["/bin/bash"]



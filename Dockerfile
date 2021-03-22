FROM node:12

RUN apt-get -qq update --fix-missing && \
	apt-get --no-install-recommends -y install \
	nginx


WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm run build
RUN rm -fr /var/www/html/xena
RUN mv demo/dist /var/www/html/xena
EXPOSE 80



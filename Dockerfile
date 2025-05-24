# use node js slim as base
FROM node:slim

WORKDIR /scr

# copy files describing dependencies
COPY package*.json ./

# install dependencies
RUN npm install

# copy project
COPY . .

# build application for prod
RUN npm run build

# expose port for react app
EXPOSE 3000

# expose port for fhir server
EXPOSE 8080

# rund react app
CMD ["npm", "start"]
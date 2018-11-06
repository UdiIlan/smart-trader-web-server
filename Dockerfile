FROM node:8

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./


ARG GITHUB_NAME
ARG GIT_ACCESS_TOKEN
ARG PORT
RUN git config --global user.name ${GITHUB_NAME}
RUN git config --global url."https://${GIT_ACCESS_TOKEN}:@github.com/".insteadOf "https://github.com/"

RUN npm install # --only=production

COPY . .

EXPOSE 3001


CMD [ "npm", "start" ]


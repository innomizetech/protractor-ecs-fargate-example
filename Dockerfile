FROM node:10

# nvm environment variables
RUN mkdir -p /usr/local/nvm
ENV NVM_DIR /usr/local/nvm
ENV HOME_DIR /home/protractor-test
ENV NODE_VERSION 10.16.0

RUN apt-get update

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -sf /bin/bash /bin/sh

# update the repository sources list
# and install dependencies
RUN apt-get update \
  && apt-get install -y curl \
  && apt-get -y autoclean

# install nvm
# https://github.com/creationix/nvm#install-script
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.31.2/install.sh | bash

# install node and npm
RUN source $NVM_DIR/nvm.sh \
  && nvm install $NODE_VERSION \
  && nvm alias default $NODE_VERSION \
  && nvm use default

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Set the working directory to /usr
# Create a directory to write temporary file during uploading
RUN rm -rf $HOME_DIR
RUN mkdir $HOME_DIR

# Add our package.json and install *before* adding our application files to
# optimize build performance
WORKDIR $HOME_DIR
ADD package.json $HOME_DIR
ADD package-lock.json $HOME_DIR

RUN npm install --unsafe-perm --save-exact -g protractor \
  && npm update

# Copy the current directory contents into the container at /usr
COPY . $HOME_DIR

# Clean and build TypeScript
RUN npm run pretest

ENTRYPOINT ["/usr/local/bin/npm", "run"]
CMD ["test:headless"]
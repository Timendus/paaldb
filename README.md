# PaalDB

A smart database of paalkampeer locations.

## Status

We can import locations from Staatsbosbeheer and Stefan Kruithof's map. Other than that it's still very much a work in progress.

## Getting it up and running

```bash
# Get the repo
git clone git@github.com:Timendus/paaldb.git
cd paaldb

# Configure your database credentials
cp config/config_example.json config/config.json
vim config/config.json

# Install dependencies
npm install

# Initialize the database
npx sequelize db:create
npx sequelize db:migrate

# Start the server
npm start
```

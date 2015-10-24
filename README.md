# Battleship

## Configuration

1. Clone the repository:
```
git clone https://github.com/sylgas/battleship-two.git
```
or
```
git clone git@github.com:sylgas/battleship-two.git
```
2. Download and install **MongoDB** from: [https://www.mongodb.org/downloads](https://www.mongodb.org/downloads)
3. Make sure mongo tools are available in the command line: ```mongod``` and ```mongo``` are in ```PATH```
4. Download and install **Node.js** from: [https://nodejs.org/en/download](https://nodejs.org/en/download)
5. Make sure node tools are available in the command line: ```npm``` and ```node``` are in ```PATH```
6. Create ```database``` folder in the project root - this will be database data directory
7. Install all project dependencies, run the following command in the project root:
```
npm install
```
Every time a new dependency is added in ```package.json``` file, you need to install it.
Dependeny modules can be updated with:
```
npm update
```

## How to start
1. Start the database server with ```database``` directory set as ```dbpath```. This can be done with ```start_database.bat``` or ```start_database.sh``` scripts.
2. The database server will be available at ```localhost:27017``` by default. For database maintenance you can access the database with ```mongo``` tool.
3. Start the application server with:
```
npm start
```
which will run the server by default at ```localhost:3000```, or manually with:
```
node app.js <PORT>
```
4. Access ```localhost:3000``` address in the browser.

function Game(name, owner) {
    this.name = name;
    this.numberOfPLayers = 6;
    this.connectedUsers = [owner];

}

Game.prototype.addPlayer = function (playerName) {
    this.connectedUsers.append(playerName);
};


Game.prototype.readyToStart = function () {
    return this.connectedUsers.length == this.numberOfPLayers
};
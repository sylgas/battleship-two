function AllGames() {
    this.runningGames = {};
    this.activeGames = {};
}

AllGames.prototype.createGame = function (name, owner, maxPlayers) {

    if (name in this.activeGames || name in this.runningGames) {
        return null;
    }
    var newGame = new Game(name, owner, maxPlayers);
    this.activeGames[name] = newGame;

    return newGame;
};

AllGames.prototype.availableGames = function () {
    return this.activeGames;
};

function Game(name, creator, maxPlayers){
    this.name = name;
    this.creator = creator;
    this.participants = [];
    this.maxPlayers = maxPlayers;
}

Game.prototype.addParticipant = function (user) {
    this.participants.push(user);
};


module.exports = AllGames;

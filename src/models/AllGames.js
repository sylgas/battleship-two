function AllGames() {
    this.runningGames = {};
    this.activeGames = {};
}

AllGames.prototype.createGame = function (name, owner) {

    if (name in this.activeGames || name in this.runningGames) {
        return None;
    }
    var newGame = new Game(name, owner);
    this.activeGames[name] = newGame;

    return newGame;
};

module.exports = AllGames;


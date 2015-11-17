function AllGames() {

    self.runningGames = {};
    self.activeGames = {};

}


AllGames.prototype.createGame = function (name, owner) {

    if (name in self.activeGames || name in self.runningGames) {
        return None;
    }
    var newGame = new Game(name, owner);
    self.activeGames[name] = newGame;

    return newGame;
};


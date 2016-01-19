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

AllGames.prototype.coPlayersBySocketId = function(socketId){
  var sids = [];
  var that = this;
  Object.keys(this.runningGames).forEach(function(kGame){
    var game = that.runningGames[kGame];
    var gameParticipants = game.participants.map(function(user){return user.clientId;});
    var index = gameParticipants.indexOf(socketId);
    var cpy = gameParticipants.slice();
    if( index > -1){
      cpy.splice(index,1);
      sids = sids.concat(cpy);
    }
  });
  return sids;
};

AllGames.prototype.removeGameBySocketId = function(socketId){

  var index = -1;
  var that = this;
  var participantsCount = 0;
  Object.keys(this.runningGames).forEach(function(kGame, ind){
    var game = that.runningGames[kGame];
    var gameParticipants = game.participants.map(function(user){return user.clientId;});
    if(gameParticipants.indexOf(socketId) > -1){
        index = ind;
        participantIndex = gameParticipants.indexOf(socketId);
        game.participants[participantIndex].alive = false;

        for (var i = 0; i < game.participants.length; i++) {
            var user = game.participants[i];
            if (user.alive) {
                participantsCount++;
            }
        }

        console.log("user left in all games");
        if(game.currentPlayerIndex === participantIndex) {
            game.currentPlayerIndex = 0;
            console.log("currentPlayerIndex: " + game.currentPlayerIndex);
        }
    }
  });
  if(index > -1 && participantsCount <= 1){
    console.log("game removed BySocketId " + participantsCount);
    delete this.runningGames[Object.keys(this.runningGames)[index]];
  }
};

AllGames.prototype.availableGames = function () {
    return this.activeGames;
};

function Game(name, creator, maxPlayers){
    this.name = name;
    this.creator = creator;
    this.currentPlayerIndex = 0;
    this.participants = [];
    this.maxPlayers = maxPlayers;
}

Game.prototype.addParticipant = function (user) {
    this.participants.push(user);
};

Game.prototype.getCurrentPlayer = function() {
    return this.participants[this.currentPlayerIndex];
};

Game.prototype.nextTurn = function() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.participants.length;
};

Game.prototype.findParticipantByName = function(name){
    for (var i = 0; i < this.participants.length; i++) {
        if (this.participants[i].name === name){
            return this.participants[i];
        }
    }
};

module.exports = AllGames;

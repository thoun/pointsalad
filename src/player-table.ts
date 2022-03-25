const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;

    constructor(private game: PointSaladGame, player: PointSaladPlayer) {
        this.playerId = Number(player.id);

        let html = `
        <div id="player-table-${player.id}" class="player-table whiteblock">
            <div id="player-name-${player.id}" class="player-name" style="color: #${player.color}">${player.name}</div> 
        </div>
        `;
        dojo.place(html, this.playerId === this.game.getPlayerId() ? 'currentplayertable' : 'playerstables');
    }

}
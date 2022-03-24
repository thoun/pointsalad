<?php

trait StateTrait {

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */

    function stNextPlayer() {
        $playerId = $this->getActivePlayerId();

        $this->checkPlayerToEliminate();

        $this->giveExtraTime($playerId);

        $this->activeNextPlayer();
        $playerId = intval($this->getActivePlayerId());

        if ($this->isEliminated($playerId)) {
            return $this->stNextPlayer();
        }

        $this->checkPlayerToEliminate();

        $endOfRound = $playerId == intval($this->getGameStateValue(FIRST_PLAYER));

        $this->gamestate->nextState($endOfRound ? 'endScore' : 'nextPlayer');
    }

    function stEndScore() {
        $playersIds = $this->getPlayersIds();
        foreach ($playersIds as $playerId) {
            $this->notifUpdateScoreSheet($playerId, true);
        }

        $this->gamestate->nextState('endGame');
    }
}

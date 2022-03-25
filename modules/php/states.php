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

        $this->giveExtraTime($playerId);

        $this->activeNextPlayer();

        $endScore = $this->getRemainingCardCountOnTable() === 0;

        $this->gamestate->nextState($endScore ? 'endScore' : 'nextPlayer');
    }

    function stEndScore() {
        // TODO update player_score_aux

        $this->gamestate->nextState('endGame');
    }
}

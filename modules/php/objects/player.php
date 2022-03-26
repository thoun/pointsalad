<?php

class PointSaladPlayer {
    public int $id;
    public int $no;
    public int $score;

    public function __construct($dbPlayer) {
        $this->id = intval($dbPlayer['player_id']);
        $this->no = intval($dbPlayer['player_no']);
        $this->score = intval($dbPlayer['player_score']);
    } 
}
?>
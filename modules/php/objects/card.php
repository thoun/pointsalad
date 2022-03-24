<?php

class Card {
    public int $id;
    public int $veggie;
    public int $index;
    public int $side; // 0 : point side, 1 : veggie side
    public string $location; // 'pile'.$pile, 'market'.$pile, 'player'
    public int $locationArg; // order, order (1,2), playerId

    public function __construct($dbCard) {
        $this->id = intval($dbCard['id']);
        $type = intval($dbCard['type']); // 100 * veggie + type
        $this->veggie = floor($type / 100);
        $this->index = $type % 100;
        $this->side = intval($dbCard['type_arg']); // 0 : point side, 1 : veggie side
        $this->location = $dbCard['location'];
        $this->locationArg = intval($dbCard['location_arg']);
    } 
}
?>
<?php

class Card {
    public int $id;
    public int $type;
    public int $subType;
    public string $location;
    public int $locationArg;

    public function __construct($dbCard) {
        $this->id = intval($dbCard['id']);
        $this->type = intval($dbCard['type']);
        $this->subType = intval($dbCard['type_arg']);
        $this->location = intval($dbCard['location']);
        $this->locationArg = intval($dbCard['location_arg']);
    } 
}
?>
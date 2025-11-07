<?php

namespace Bga\Games\ScreamPark\components\genres;

use Bga\Games\ScreamPark\components\Cards;
use Bga\Games\ScreamPark\Game;

class Genres extends Cards
{
    private readonly array $GENRES;

    public function __construct(Game $game)
    {
        parent::__construct($game, $game->genre_cards, "genres");
        $this->GENRES = $this->game->GENRES;
    }

    public function setup(): void
    {
        $cards = [];
        foreach ($this->GENRES as $genre_id => $genre) {
            $cards[] = [
                "type" => $genre["name"],
                "type_arg" => $genre_id,
                "nbr" => 10
            ];
        }
        $this->deck->createCards($cards);

        foreach ($this->GENRES as $genre_id => $genre) {
            $card_id = $this->game->getUniqueValueFromDB("SELECT card_id FROM {$this->dbTable} 
            WHERE card_type_arg={$genre_id} AND card_location='box' LIMIT 1");

            $this->deck->moveCard($card_id, "deck");
        }

        $this->deck->shuffle("box");
        $this->deck->shuffle("deck");
    }
}

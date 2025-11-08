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
    }
}

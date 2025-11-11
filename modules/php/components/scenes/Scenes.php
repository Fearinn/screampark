<?php

namespace Bga\Games\ScreamPark\components\scenes;

use Bga\Games\ScreamPark\components\Cards;
use Bga\Games\ScreamPark\Game;

class Scenes extends Cards
{
    private readonly array $SCENES;
    private readonly array $GENRES;

    public function __construct(Game $game)
    {
        parent::__construct($game, $game->scene_cards, "scenes");
        $this->SCENES = $this->game->SCENES;
        $this->GENRES = $this->game->GENRES;
    }

    public function setup(): void
    {

        $sceneCards = [];
        foreach ($this->SCENES as $scene_id => $scene) {
            $sceneCards[] = [
                "type" => "scene",
                "type_arg" => $scene_id,
                "nbr" => 1
            ];
        }
        $this->deck->createCards($sceneCards);
        $this->deck->shuffle("deck");

        $playerCount = $this->game->getPlayerCount();

        $genreCards = [];
        foreach ($this->GENRES as $genre_id => $genre) {
            $genreCards[] = [
                "type" => "genre",
                "type_arg" => $genre_id,
                "nbr" => 9 * $playerCount, 
            ];
        }

        $this->deck->createCards($genreCards, "genres");
    }
}

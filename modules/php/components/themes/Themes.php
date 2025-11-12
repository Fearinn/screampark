<?php

namespace Bga\Games\ScreamPark\components\themes;

use Bga\Games\ScreamPark\components\Cards;
use Bga\Games\ScreamPark\Game;

class Themes extends Cards
{
    private readonly array $THEMES;

    public function __construct(Game $game)
    {
        parent::__construct($game, $game->theme_cards, "themes");
        $this->THEMES = $this->game->THEMES;
    }

    public function setup(): void
    {
        $cards = [];
        foreach ($this->THEMES as $theme_id => $theme) {
            $cards[] = [
                "type" => "theme",
                "type_arg" => $theme_id,
                "nbr" => 1
            ];
        }
        $this->deck->createCards($cards);
        $this->deck->shuffle("deck");

        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            $this->deck->pickCards(2, "deck", $player_id);
        }
    }
}

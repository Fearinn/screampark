<?php

namespace Bga\Games\ScreamPark\components\vips;

use Bga\Games\ScreamPark\components\Cards;
use Bga\Games\ScreamPark\Game;

class Vips extends Cards
{
    private readonly array $VIPS;
    public function __construct(Game $game)
    {
        parent::__construct($game, $game->vip_cards, "vips");
        $this->VIPS = $this->game->VIPS;
    }

    public function setup(): void
    {
        $cards = [];
        foreach ($this->VIPS as $vip_id => $vip) {
            $cards[] = [
                "type" => $vip["name"],
                "type_arg" => $vip_id,
                "nbr" => 1
            ];
        }
        $this->deck->createCards($cards);
        $this->deck->shuffle("deck");

        for ($day = 1; $day <= 3; $day++) {
            $this->deck->pickCardForLocation("deck", "board", $day);
        }
    }
}

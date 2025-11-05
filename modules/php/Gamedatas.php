<?php

namespace Bga\Games\ScreamPark;

use Bga\Games\ScreamPark\components\vips\Vips;
use Bga\Games\ScreamPark\Game;

trait Gamedatas
{

    public function getGamedatas(Game $game)
    {
        $Vips = new Vips($game);
        $Vips->getPublic();

        $gamedatas = [
            "players" => $game->getCollectionFromDb("SELECT `player_id` `id`, `player_score` `score` FROM `player`"),
            "vipCards" => $Vips->getPublic(),
        ];

        return $gamedatas;
    }
}

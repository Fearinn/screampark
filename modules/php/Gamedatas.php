<?php

namespace Bga\Games\ScreamPark;

use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\components\vips\Vips;
use Bga\Games\ScreamPark\Game;

trait Gamedatas
{

    public function getGamedatas(Game $game)
    {
        $Vips = new Vips($game);
        $Scenes = new Scenes($game);

        $gamedatas = [
            "players" => $game->getCollectionFromDb("SELECT `player_id` `id`, `player_score` `score` FROM `player`"),
            "VIPS" => $game->VIPS,
            "vipCards" => $Vips->getPublic(),
            "GENRES" => $game->GENRES,
            "SCENES" => $game->SCENES,
            "sceneDeckCount" => $Scenes->getDeckCount(),
        ];

        return $gamedatas;
    }
}

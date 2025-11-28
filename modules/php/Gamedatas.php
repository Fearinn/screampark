<?php

namespace Bga\Games\ScreamPark;

use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\components\themes\Themes;
use Bga\Games\ScreamPark\components\vips\Vips;

trait Gamedatas
{
    public function getGamedatas()
    {
        $playerId = $this->getCurrentPlayerId();

        $Vips = new Vips($this);
        $Scenes = new Scenes($this);
        $Themes = new Themes($this);
        $Scenes = new Scenes($this);

        $gamedatas = [
            "players" => $this->getCollectionFromDb("SELECT `player_id` `id`, `player_score` `score` FROM `player`"),
            "VIPS" => $this->VIPS,
            "vipCards" => $Vips->getPublic(),
            "GENRES" => $this->GENRES,
            "SCENES" => $this->SCENES,
            "sceneDeckCount" => $Scenes->getDeckCount(),
            "THEMES" => $this->THEMES,
            "themeCards" => $Themes->getPublic(),
            "themeHands" => $Themes->getHands($playerId),
            "sceneHand" => !$this->isSpectator() ? $Scenes->getHand($playerId) : [],
            "sceneCards" => $Scenes->getPublic(),
            "sceneBoard" => !$this->isSpectator() ? $Scenes->getBoard($playerId) : [],
            "staffCounts" => $this->staffCounter->getAll(),
            "day" => $this->dayCounter->get(),
        ];

        if (!$this->isSpectator()) {
            $gamedatas["staffCountPrivate"] = $this->staffCounterPrivate->get($playerId);
        }

        return $gamedatas;
    }
}

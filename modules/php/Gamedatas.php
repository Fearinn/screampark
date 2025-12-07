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
        $isSpectator = $this->isSpectator();

        $Vips = new Vips($this);
        $Scenes = new Scenes($this);
        $Themes = new Themes($this);
        $Scenes = new Scenes($this);

        $day = $this->dayCounter->get();
        $completedScenes = $this->globals->get(gCompletedScenes, []);
        if (!$isSpectator) {
            $completedScenes += $this->globals->get(gCompletedScenesPrivate)[$playerId];
        }

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
            "sceneHand" => !$isSpectator ? $Scenes->getHand($playerId) : [],
            "scenePublic" => $Scenes->getPublic($playerId),
            "sceneBoard" => !$isSpectator ? $Scenes->getBoard($playerId) : [],
            "completedScenes" => $completedScenes,
            "staffCounts" => $this->staffCounter->getAll(),
            "day" => $day,
            "passToIds" => $day === 2 ?  $this->getPrevPlayerTable() : $this->getNextPlayerTable(),
            "receiveFromIds" => $day === 2 ? $this->getNextPlayerTable() : $this->getPrevPlayerTable(),
        ];

        if (!$isSpectator) {
            $gamedatas["staffCountPrivate"] = $this->staffCounterPrivate->get($playerId);
        }

        return $gamedatas;
    }
}

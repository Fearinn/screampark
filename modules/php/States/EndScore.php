<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\StateType;
use Bga\Games\ScreamPark\components\scenes\Scene;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\components\themes\Themes;
use Bga\Games\ScreamPark\Game;

const ST_END_GAME = 99;

class EndScore extends \Bga\GameFramework\States\GameState
{
    protected Scenes $scenes;
    protected Themes $themes;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 98,
            type: StateType::GAME,
            description: clienttranslate("Final scoring...")
        );

        $this->scenes = new Scenes($this->game);
        $this->themes = new Themes($this->game);
    }

    public function onEnteringState(): int
    {
        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $playerId => $player) {
            $maxSlot = $this->scenes->getMaxSlot($playerId);

            $this->scoreScenes($playerId, $maxSlot);
            $this->scoreScenic($playerId, $maxSlot);
            $this->scoreStaff($playerId);
        }
        $this->scoreAbilities();

        return ST_END_GAME;
    }

    public function scoreScenes(int $playerId, $maxSlot): int
    {
        $scenePoints = 0;
        for ($slot = 1; $slot <= $maxSlot; $slot++) {
            $Scene = $this->scenes->getMainInSlot($playerId, $slot);

            if (!$Scene->isComplete()) {
                continue;
            }

            $scenePoints += $Scene->points;

            $this->notify->all(
                "scoreScene",
                "",
                [
                    "player_id" => $playerId,
                    "points" => $Scene->points,
                    "card" => $Scene->card,
                ],
            );

            $this->playerScore->inc($playerId, $scenePoints);
        }

        $this->notify->all(
            "message",
            clienttranslate('${player_name} scores ${points} point(s) with completed scenes'),
            [
                "player_id" => $playerId,
                "points" => $scenePoints,
            ]
        );

        return $scenePoints;
    }

    public function scoreScenic(int $playerId, int $maxSlot): int
    {
        $scenicsCounts = array_fill(1, 4, 0);

        for ($slot = 1; $slot <= $maxSlot; $slot++) {
            $slotScenics = array_fill(1, 4, 0);
            $copies = 0;

            $Scenes = $this->scenes->getScenesInSlot($playerId, $slot);
            foreach ($Scenes as $Scene) {
                $scenic = (int) $Scene->scenic;

                if ($scenic > 0) {
                    $slotScenics[$scenic];
                }

                if ($Scene->ability === 2) {
                    $copies++;
                }
            }

            if (min($scenicsCounts) === 0) {
                continue;
            }

            for ($i = 1; $i <= $copies; $i++) {
                $min = min($slotScenics);
                $scenic = array_search($min, $slotScenics);
                $slotScenics[$scenic]++;
            }

            foreach ($slotScenics as $scenic => $count) {
                $scenicsCounts[$scenic] += $count;
            }
        }

        $setCount = min($scenicsCounts);
        $scenicPoints = $setCount * 6;

        $this->notify->all(
            "message",
            clienttranslate('${player_name} has ${sets} scenic sets and scores ${points} point(s) '),
            [
                "player_id" => $playerId,
                "sets" => $setCount,
                "points" => $scenicPoints,
            ]
        );

        $this->playerScore->inc($playerId, $scenicPoints);
        return $scenicPoints;
    }

    public function scoreAbilities(): void
    {
        $abilitiesCounts = [];

        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $playerId => $player) {
            $abilitiesCounts[$playerId] = 0;

            $cards = $this->scenes->getBoard($playerId);
            foreach ($cards as $card) {
                if ($card["type"] === "genre") {
                    continue;
                }

                $cardId = (int) $card["id"];
                $Scene = new Scene($this->game, $cardId);

                if ($Scene->ability > 0) {
                    $abilitiesCounts[$playerId]++;
                }
            }
        }

        $maxCount = max($abilitiesCounts);
        if ($maxCount === 0) {
            return;
        }

        foreach ($players as $playerId => $player) {
            $count = $abilitiesCounts[$playerId];
            if ($count < $maxCount) {
                continue;
            }

            $this->notify->all(
                "message",
                clienttranslate('${player_name} has the most (${effects}) special effects and scores 3 points'),
                [
                    "player_id" => $playerId,
                    "effects" => $count,
                ]
            );

            $this->playerScore->inc($playerId, 3);
        }
    }

    public function scoreStaff(int $playerId): void
    {
        $staffPoints = 0;

        $cards = $this->scenes->getBoard($playerId);
        foreach ($cards as $card) {
            if ($card["type"] === "genre") {
                continue;
            }

            $cardId = (int) $card["id"];
            $Scene = new Scene($this->game, $cardId);
            $staffPoints += $Scene->staffCost;
        }

        $this->notify->all(
            "message",
            clienttranslate('${player_name} scores ${points} point(s) from staffing'),
            [
                "player_id" => $playerId,
                "points" => $staffPoints,
            ]
        );

        $this->playerScore->inc($playerId, $staffPoints);
    }
}

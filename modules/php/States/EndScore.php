<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\Components\Counters\PlayerCounter;
use Bga\GameFramework\Components\Counters\TableCounter;
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
    protected PlayerCounter $staffCounter;
    protected PlayerCounter $abilityCounter;
    protected TableCounter $oppAbilityCounter;

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
        $this->staffCounter = $this->game->staffCounter;
        $this->abilityCounter = $this->game->abilityCounter;
        $this->oppAbilityCounter = $this->game->oppAbilityCounter;
    }

    public function onEnteringState(): int
    {
        $this->scoreAbilities();

        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $playerId => $player) {
            $maxSlot = $this->scenes->getMaxSlot($playerId);

            for ($slot = 1; $slot <= $maxSlot; $slot++) {
                $genres = $this->scenes->sumSlotGenres($playerId, $slot);
                foreach ($genres as $genreId => $value) {
                    $this->playerStats->inc("statGenre{$genreId}", $value, $playerId);
                }
            }

            $this->scoreScenes($playerId, $maxSlot);
            $this->scoreScenic($playerId, $maxSlot);
            $this->scoreStaff($playerId);
            $this->computeTieBreakers($playerId);

            $points = $this->playerScore->get($playerId);
            $this->playerStats->set(statScore, $points, $playerId);

            if ($this->game->isSolo()) {
                $themeId = $this->themes->getId($playerId);

                if ($points < 80) {
                    $this->notify->all(
                        "message",
                        clienttranslate('${player_name} fails to score 80 or more points (${points})'),
                        [
                            "player_id" => $playerId,
                            "points" => $points,
                        ],
                    );

                    $this->tableStats->set("statTheme{$themeId}", 0);
                    $this->playerScore->set($playerId, 0);
                }

                $this->tableStats->set("statTheme{$themeId}", 100);
                return ST_END_GAME;
            }
        }

        $tiedPlayers = [];
        foreach ($players as $playerId => $player) {
            $themeId = $this->themes->getId($playerId);

            if ($this->playerScore->getMax() === $this->playerScore->get($playerId)) {
                $tiedPlayers[$playerId] = $themeId;
                continue;
            }

            $this->tableStats->set("statTheme{$themeId}", 0);
        }

        if (count($tiedPlayers) > 1) {
            foreach ($tiedPlayers as $playerId => $themeId) {
                if ($this->playerScoreAux->getMax() === $this->playerScoreAux->get($playerId)) {
                    $this->tableStats->set("statTheme{$themeId}", 100);
                    continue;
                }

                $this->tableStats->set("statTheme{$themeId}", 0);
            }
        }

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

            $this->playerStats->inc(statCompletedScenes, 1, $playerId);
            $this->playerScore->inc($playerId, $Scene->points);
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
            clienttranslate('${player_name} has ${setCount} scenic sets and scores ${points} point(s) '),
            [
                "player_id" => $playerId,
                "setCount" => $setCount,
                "points" => $scenicPoints,
            ]
        );

        $this->playerScore->inc($playerId, $scenicPoints);
        return $scenicPoints;
    }

    public function scoreAbilities(): void
    {
        $players = $this->game->loadPlayersBasicInfos();

        if ($this->game->isSolo()) {
            foreach ($players as $playerId => $player) {
                $count = $this->abilityCounter->get($playerId);

                if ($count === 0) {
                    return;
                }

                if ($count >= $this->oppAbilityCounter->get()) {
                    $this->playerScore->inc($playerId, 3);

                    $this->notify->all(
                        "message",
                        clienttranslate('${player_name} has the most (${effectCount}) special effects and scores 3 points'),
                        [
                            "player_id" => $playerId,
                            "effectCount" => $count,
                        ]
                    );
                }
            }
            return;
        }

        $maxCount = $this->abilityCounter->getMax();
        if ($maxCount === 0) {
            return;
        }

        foreach ($players as $playerId => $player) {
            $count = $this->abilityCounter->get($playerId);
            if ($count < $maxCount) {
                continue;
            }

            $this->notify->all(
                "message",
                clienttranslate('${player_name} has the most (${effectCount}) special effects and scores 3 points'),
                [
                    "player_id" => $playerId,
                    "effectCount" => $count,
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

    public function computeTieBreakers(int $playerId): void
    {
        $staffCount = $this->staffCounter->get($playerId);

        $sql = "SELECT COUNT(card_id) FROM {$this->scenes->dbTable} 
        WHERE card_location='board' AND card_location_arg={$playerId} AND card_type='scene'";

        $sceneCount = (int) $this->game->getUniqueValueFromDB($sql);
        $this->playerStats->set(statTotalScenes, $sceneCount, $playerId);

        $cardCount = $this->scenes->deck->countCardInLocation("board", $playerId);

        $scoreAux = $staffCount * 10000 + $sceneCount * 100 + $cardCount;
        $this->playerScoreAux->set($playerId, $scoreAux);
    }
}

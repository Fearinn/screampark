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
        $this->oppAbilityCounter = $this->game->oppAbilityCounter;
    }

    public function onEnteringState(): int
    {
        $this->scoreAbilities();

        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $playerId => $player) {
            $maxSlot = $this->scenes->getMaxSlot($playerId);
            $this->playerStats->set(statTotalScenes, $maxSlot, $playerId);

            for ($slot = 1; $slot <= $maxSlot; $slot++) {
                $genres = $this->scenes->sumSlotGenres($playerId, $slot);
                foreach ($genres as $genreId => $value) {
                    $this->playerStats->inc("statGenre{$genreId}", $value, $playerId);
                }
            }

            $this->scoreScenic($playerId, $maxSlot);
            $this->scoreStaff($playerId);
            $this->scoreScenes($playerId, $maxSlot);
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
            }
        }

        foreach ($tiedPlayers as $playerId => $themeId) {
            if (count($tiedPlayers) > 1) {
                if ($this->playerScoreAux->getMax() === $this->playerScoreAux->get($playerId)) {
                    $this->tableStats->set("statTheme{$themeId}", 100);
                }

                continue;
            }

            $this->tableStats->set("statTheme{$themeId}", 100);
        }


        return ST_END_GAME;
    }

    public function scoreScenes(int $playerId, $maxSlot): int
    {
        $scenePoints = 0;
        for ($slot = 1; $slot <= $maxSlot; $slot++) {
            $Scene = $this->scenes->getMainInSlot($playerId, $slot);

            if (!$Scene->isComplete($playerId)) {
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
        $availableCopies = [];

        for ($slot = 1; $slot <= $maxSlot; $slot++) {
            $slotScenics = [];
            $copyCount = 0;

            $Scenes = $this->scenes->getScenesInSlot($playerId, $slot);
            foreach ($Scenes as $Scene) {
                $scenic = (int) $Scene->scenic;

                if ($scenic > 0) {
                    if (!in_array($scenic, $slotScenics)) {
                        $slotScenics[] = $scenic;
                    }

                    $scenicsCounts[$scenic]++;
                }

                if ($Scene->ability === 2) {
                    $copyCount++;
                }
            }

            if (!empty($slotScenics) && $copyCount > 0) {
                $availableCopies[$slot] = [
                    "scenics" => $slotScenics,
                    "count" => $copyCount
                ];
            }
        }

        $maxSetCount = min($scenicsCounts);
        $totalAvailableCopies = 0;
        foreach ($availableCopies as $options) {
            $totalAvailableCopies += $options["count"];
        }

        $initialState = [
            "counts" => $scenicsCounts,
            "slotsUsed" => array_fill(1, $maxSlot, 0)
        ];

        $states = [$initialState];

        for ($level = 1; $level <= $totalAvailableCopies; $level++) {
            $newStates = [];
            $seenStates = [];

            foreach ($states as $state) {
                $counts = $state["counts"];
                $slotsUsed = $state["slotsUsed"];

                foreach ($availableCopies as $slot => $options) {
                    $remainingCopies = $options["count"] - $slotsUsed[$slot];

                    if ($remainingCopies > 0) {
                        foreach ($options["scenics"] as $scenic) {
                            if ($counts[$scenic] > 0) {
                                $newCounts = $counts;
                                $newCounts[$scenic]++;
                                $newMin = min($newCounts);

                                if ($newMin > $maxSetCount) {
                                    $maxSetCount = $newMin;
                                }

                                $newSlotsUsed = $slotsUsed;
                                $newSlotsUsed[$slot]++;

                                $stateKey = json_encode($newCounts) . "|" . json_encode($newSlotsUsed);

                                if (!isset($seenStates[$stateKey])) {
                                    $seenStates[$stateKey] = true;
                                    $newStates[] = [
                                        "counts" => $newCounts,
                                        "slotsUsed" => $newSlotsUsed
                                    ];
                                }
                            }
                        }
                    }
                }
            }

            $states = $newStates;
            if (empty($states)) {
                break;
            }
        }

        $setCount = $maxSetCount;
        $scenicPoints = $setCount * 6;

        $this->notify->all(
            "message",
            clienttranslate('${player_name} has ${setCount} scenic set(s) and scores ${points} point(s)'),
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
        $abilityCounts = $this->scenes->getAbilityCounts();

        if ($this->game->isSolo()) {
            foreach ($abilityCounts as $playerId => $count) {
                if ($count === 0) {
                    return;
                }

                if ($count >= $this->oppAbilityCounter->get()) {
                    $this->playerScore->inc($playerId, 3);

                    $this->notify->all(
                        "message",
                        clienttranslate('${player_name} has the most (${abilityCount}) abilities and scores 3 points'),
                        [
                            "player_id" => $playerId,
                            "abilityCount" => $count,
                        ]
                    );
                }
            }
            return;
        }


        $maxCount = max($abilityCounts);
        if ($maxCount === 0) {
            return;
        }

        foreach ($abilityCounts as $playerId => $count) {
            if ($count < $maxCount) {
                continue;
            }

            $this->notify->all(
                "message",
                clienttranslate('${player_name} has the most (${abilityCount}) abilities and scores 3 points'),
                [
                    "player_id" => $playerId,
                    "abilityCount" => $count,
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

        $cardCount = (int) $this->scenes->deck->countCardInLocation("board", $playerId);
        $this->playerStats->set(statCardsPlayed, $cardCount, $playerId);

        $scoreAux = $staffCount * 10000 + $sceneCount * 100 + $cardCount;
        $this->playerScoreAux->set($playerId, $scoreAux);
    }
}

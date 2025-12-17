<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\Components\Counters\PlayerCounter;
use Bga\GameFramework\Components\Counters\TableCounter;
use Bga\GameFramework\NotificationMessage;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\GameFramework\Table;
use Bga\Games\ScreamPark\components\scenes\Scene;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\components\themes\Themes;
use Bga\Games\ScreamPark\components\vips\Vips;
use Bga\Games\ScreamPark\Game;

class DayEnd extends GameState
{
    protected Scenes $scenes;
    protected Themes $themes;
    protected Vips $vips;
    protected PlayerCounter $abilityCounter;
    protected TableCounter $oppAbilityCounter;
    protected TableCounter $dayCounter;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 9,
            type: StateType::GAME,
            description: clienttranslate('Ending day...'),
        );

        $this->scenes = new Scenes($this->game);
        $this->themes = new Themes($this->game);
        $this->vips = new Vips($this->game);
        $this->dayCounter = $this->game->dayCounter;
        $this->oppAbilityCounter = $this->game->oppAbilityCounter;
    }

    public function onEnteringState(): string
    {
        $players = $this->game->loadPlayersBasicInfos();

        foreach ($players as $playerId => $player) {
            $maxSlot = $this->scenes->getMaxSlot($playerId);

            $themePoints = 0;
            for ($slot = 1; $slot <= $maxSlot; $slot++) {
                $Scene = $this->scenes->getMainInSlot($playerId, $slot);

                $themePoints += $Scene->scoreTheme($playerId);
            }

            $this->game->notify->all(
                "scoreTheme",
                clienttranslate('${player_name} scores ${points} point(s) with his Theme'),
                [
                    "player_id" => $playerId,
                    "points" => $themePoints,
                ]
            );

            $vipPoints = 0;
            for ($slot = 1; $slot <= $maxSlot; $slot++) {
                $Scene = $this->scenes->getMainInSlot($playerId, $slot);

                if (!$Scene->scoreVip($playerId)) {
                    break;
                };

                $vipPoints += 2;
            }

            $this->game->notify->all(
                "message",
                clienttranslate('${player_name} scores ${points} point(s) with the VIP'),
                [
                    "player_id" => $playerId,
                    "points" => $vipPoints,
                ]
            );

            $vipFulfillingScenes = $this->scenes->getVipFulfilling($playerId);
            foreach ($vipFulfillingScenes as $cardId) {
                $Scene = new Scene($this->game, $cardId);

                $this->game->notify->player(
                    $playerId,
                    "updateVipFulfilling",
                    "",
                    [
                        "card" => $Scene->card,
                        "fulfills" => true,
                    ]
                );
            }
        }

        if ($this->game->isSolo()) {
            $cards = $this->scenes->deck->pickCardsForLocation(3, "deck", "oppAbility");
            [$card, $card2, $card3] = $cards;

            $cardId = (int) $card["id"];
            $cardId2 = (int) $card2["id"];
            $cardId3 = (int) $card3["id"];

            $Scene = new Scene($this->game, $cardId);
            $Scene2 = new Scene($this->game, $cardId2);
            $Scene3 = new Scene($this->game, $cardId3);

            $this->notify->all(
                "drawToDiscard",
                clienttranslate('3 cards are drawn to rack up opposing ${lightning_icon}: ${sceneLabel}, ${sceneLabel2} and ${sceneLabel3}'),
                [
                    "i18n" => ["sceneLabel", "sceneLabel2", "sceneLabel3"],
                    "preserve" => ["sceneId", "sceneId2", "sceneId3"],
                    "sceneLabel" => $Scene->upLabel,
                    "sceneId" => $Scene->id,
                    "sceneLabel2" => $Scene2->upLabel,
                    "sceneId2" => $Scene2->id,
                    "sceneLabel3" => $Scene3->upLabel,
                    "sceneId3" => $Scene3->id,
                    "cards" => array_values($cards),
                ]
            );

            $abilityCount = 0;

            foreach ([$Scene->ability, $Scene2->ability, $Scene3->ability] as $ability) {
                if ($ability > 0) {
                    $abilityCount++;
                }
            }

            $this->oppAbilityCounter->inc($abilityCount);
        }

        $DAYS = [
            1 => clienttranslate('Friday'),
            2 => clienttranslate('Saturday'),
            3 => clienttranslate('Sunday'),
        ];

        $day = $this->dayCounter->inc(1);
        $previousDay = $day - 1;
        $message = $day <= 3 ? clienttranslate('${dayLabel} ends. A new day begins') : clienttranslate('${dayLabel} ends');

        $this->notify->all(
            "dayEnd",
            $message,
            [
                "i18n" => ["dayLabel"],
                "previousDay" => $previousDay,
                "dayLabel" => $DAYS[$previousDay],
                "day" => $day,
            ]
        );

        if ($day > 3) {
            return EndScore::class;
        }

        return DealScenes::class;
    }
}

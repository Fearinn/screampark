<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\Components\Counters\TableCounter;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\components\themes\Themes;
use Bga\Games\ScreamPark\components\vips\Vips;
use Bga\Games\ScreamPark\Game;

class DayEnd extends GameState
{
    protected TableCounter $dayCounter;
    protected Scenes $scenes;
    protected Themes $themes;
    protected Vips $vips;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 9,
            type: StateType::GAME,
            description: clienttranslate('Ending day...'),
        );

        $this->dayCounter = $this->game->dayCounter;
        $this->scenes = new Scenes($this->game);
        $this->themes = new Themes($this->game);
        $this->vips = new Vips($this->game);
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
                clienttranslate('${player_name} scores ${points} point(s) from his Theme today'),
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
                clienttranslate('${player_name} scores ${points} point(s) from the VIP today'),
                [
                    "player_id" => $playerId,
                    "points" => $vipPoints,
                ]
            );
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
            ]
        );

        if ($day > 3) {
            return EndScore::class;
        }

        return DealScenes::class;
    }
}

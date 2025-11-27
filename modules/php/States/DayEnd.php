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
            for ($slot = 1; $slot <= 24; $slot++) {
                $Scene = $this->scenes->getMainInSlot($playerId, $slot);

                if (!$Scene) {
                    continue;
                }

                $Scene->scoreTheme($playerId);
                $Scene->scoreVip($playerId);
            }
        }

        $DAYS = [
            1 => clienttranslate('Friday'),
            2 => clienttranslate('Saturday'),
            3 => clienttranslate('Sunday'),
        ];

        $day = $this->dayCounter->inc(1);
        $previousDay = $day - 1;
        $this->notify->all(
            "endDay",
            clienttranslate('${dayLabel2} ends. A new day (${dayLabel}) begins'),
            [
                "i18n" => ["dayLabel", "dayLabel2"],
                "previousDay" => $previousDay,
                "dayLabel" => $DAYS[$day],
                "dayLabel2" => $DAYS[$previousDay],
            ]
        );

        return DealScenes::class;
    }
}

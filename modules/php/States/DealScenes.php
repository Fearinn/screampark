<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\Game;

class DealScenes extends GameState
{
    protected Scenes $scenes;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 4,
            type: StateType::GAME,
            description: clienttranslate('Dealing scene cards...'),
        );

        $this->scenes = new Scenes($this->game);
    }

    public function onEnteringState(): string
    {
        $players = $this->game->loadPlayersBasicInfos();

        foreach ($players as $playerId => $player) {
            $cards = $this->scenes->deck->pickCards(8, "deck", $playerId);

            $this->notify->player(
                $playerId,
                "dealScenesPrivate",
                "",
                [
                    "cards" => $cards,
                ],
            );

            $this->notify->all(
                "dealScenes",
                "",
                [
                    "player_id" => $playerId,
                    "cardCount" => count($cards),
                ],
            );
        }

        $this->notify->all("message", clienttranslate("Each player draws 8 Scenes from the deck"));

        return PreTurn::class;
    }
}

<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\Components\Counters\PlayerCounter;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\Game;

class PassScenes extends GameState
{
    protected Scenes $scenes;
    protected array $SCENES;
    protected PlayerCounter $draftCounter;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 7,
            type: StateType::GAME,
            description: clienttranslate('Passing scene cards...'),
            initialPrivate: 51,
        );

        $this->scenes = new Scenes($this->game);
        $this->SCENES = $this->game->SCENES;
        $this->draftCounter = $this->game->draftCounter;
    }

    public function onEnteringState(): string
    {
        $this->draftCounter->setAll(0);

        if ((int) $this->scenes->deck->countCardsInLocation("hand") === 0) {
            return DayEnd::class;
        }

        $day = $this->game->dayCounter->get();
        $direction = $day % 2 === 0 ? clienttranslate("counterclockwise") : clienttranslate("clockwise");

        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $playerId => $player) {
            $otherPlayerId = $this->game->getPlayerBefore($playerId);

            if ($direction === "counterclockwise") {
                $otherPlayerId = $this->game->getPlayerAfter($playerId);
            }

            $this->scenes->deck->moveAllCardsInLocation("hand", "prehand", $otherPlayerId, $playerId);
        }

        foreach ($players as $playerId => $player) {
            $this->scenes->deck->moveAllCardsInLocation("prehand", "hand", $playerId, $playerId);
            $cards = $this->scenes->getHand($playerId);

            $this->notify->player(
                $playerId,
                "receiveCardsPrivate",
                "",
                [
                    "player_id" => $playerId,
                    "cards" => $cards,
                ],
            );

            $cards = array_map(function ($card) {
                unset($card["type_arg"]);
                return $card;
            }, $cards);

            $this->notify->all(
                "receiveCards",
                "",
                [
                    "player_id" => $playerId,
                    "otherPlayerId" => $otherPlayerId,
                    "cards" => $cards,
                ]
            );
        }

        $this->notify->all(
            "message",
            clienttranslate('All players pass their hands ${direction}'),
            [
                "i18n" => ["direction"],
                "direction" => $direction
            ],
        );

        return PreTurn::class;
    }
}

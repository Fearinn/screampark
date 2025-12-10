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

        $handCount = (int) $this->scenes->deck->countCardsInLocation("hand");
        if ($handCount === 0) {
            return DayEnd::class;
        }

        $players = $this->game->loadPlayersBasicInfos();

        if ($this->game->isSolo()) {
            foreach ($players as $playerId => $player) {
                $oldCards = $this->scenes->getHand($playerId);
                $this->scenes->deck->moveAllCardsInLocation("hand", "discard");
                $newCards = $this->scenes->deck->pickCards($handCount, "deck", $playerId);

                $this->notify->all(
                    "renewHand",
                    clienttranslate('${player_name} discards his hand and draws ${cardCount} new cards'),
                    [
                        "player_id" => $playerId,
                        "oldCards" => $oldCards,
                        "newCards" => array_values($newCards),
                        "cardCount" => $handCount,
                    ]
                );
            }

            return PreTurn::class;
        }

        $day = $this->game->dayCounter->get();
        $direction = $day === 2 ? clienttranslate("counterclockwise") : clienttranslate("clockwise");

        foreach ($players as $playerId => $player) {
            $playerId2 = $this->game->getPlayerBefore($playerId);

            if ($direction === "clockwise") {
                $playerId2 = $this->game->getPlayerAfter($playerId);
            }

            $this->scenes->deck->moveAllCardsInLocation("hand", "prehand", $playerId2, $playerId);

            $this->notify->player(
                $playerId,
                "passScenes",
                "",
                [
                    "player_id2" => $playerId2,
                ]
            );
        }

        foreach ($players as $playerId => $player) {
            $playerId2 = $this->game->getPlayerBefore($playerId);

            if ($direction === "clockwise") {
                $playerId2 = $this->game->getPlayerAfter($playerId);
            }

            $this->scenes->deck->moveAllCardsInLocation("prehand", "hand", $playerId, $playerId);
            $cards = $this->scenes->getHand($playerId);

            $this->notify->player(
                $playerId,
                "receiveScenesPrivate",
                "",
                [
                    "player_id" => $playerId,
                    "player_id2" => $playerId2,
                    "cards" => $cards,
                ],
            );

            $cards = array_map(function ($card) {
                unset($card["type_arg"]);
                return $card;
            }, $cards);

            $this->notify->all(
                "receiveScenes",
                "",
                [
                    "player_id" => $playerId,
                    "player_id2" => $playerId2,
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

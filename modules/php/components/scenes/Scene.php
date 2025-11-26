<?php

namespace Bga\Games\ScreamPark\components\scenes;

use Bga\Games\ScreamPark\Game;

class Scene extends Scenes
{
    public readonly array $card;
    private readonly int $cardId;
    public readonly int $id;
    public readonly int $points;
    public readonly int $staffCost;
    public readonly array $GENRES;
    public readonly string $upLabel;
    public readonly STRING $downLabel;

    public function __construct(Game $game, int $cardId)
    {
        parent::__construct($game, $game->scene_cards, "scenes");

        $this->card = $this->getCard($cardId);
        $sceneId = (int) $this->card["type_arg"];

        $this->cardId = $cardId;
        $this->id = $sceneId;

        $SCENE = $this->SCENES[$this->id];
        $UP = $SCENE["UP"];
        $DOWN = $SCENE["DOWN"];
        $this->points = (int) $UP["points"];
        $this->staffCost = (int) $DOWN["staffCost"];
        $this->upLabel = $UP["label"];
        $this->downLabel = $DOWN["label"];
    }

    private function move(string $location, int $location_arg = 0): array
    {
        $this->deck->moveCard($this->cardId, $location, $location_arg);
        return $this->getCard($this->cardId);
    }

    private function canPayCost(int $playerId): bool
    {
        return $this->staffCost <= $this->staffCounterPrivate->get($playerId);
    }

    public function isPlayable(int $playerId): bool
    {
        return $this->points >= $this->getMinPoints($playerId)
            && $this->canPayCost($playerId);
    }

    public function place(int $playerId): void
    {
        if ($this->staffCost > 0) {
            $this->staffCounterPrivate->inc(
                $playerId,
                -$this->staffCost,
            );

            $this->game->notify->player(
                $playerId,
                "setCounterPrivate",
                "",
                [
                    "name" => "staff",
                    "inc" => -$this->staffCost,
                ]
            );
        }

        $slot = $this->getMaxSlot($playerId) + 1;

        $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='placed', card_location_arg={$playerId}, 
        slot={$slot}, position=1 WHERE card_id={$this->cardId}");
        $card = $this->getCard($this->cardId);

        $this->game->notify->player(
            $playerId,
            "placeScenePrivate",
            clienttranslate('You place ${sceneLabel} as a new scene'),
            [
                "i18n" => ["sceneLabel"],
                "preserve" => ["sceneId"],
                "sceneLabel" => $this->upLabel,
                "sceneId" => $this->id,
                "card" => $card,
            ]
        );
    }

    public function revealPlayed(int $playerId): void
    {
        $card = $this->move("board", $playerId);
        $position = (int) $card["position"];

        if ($position === 1) {
            $this->game->notify->all(
                "placeScene",
                clienttranslate('${player_name} plays ${sceneLabel} as a new scene'),
                [
                    "i18n" => ["sceneLabel"],
                    "preserve" => ["sceneId"],
                    "player_id" => $playerId,
                    "sceneLabel" => $this->upLabel,
                    "sceneId" => $this->id,
                    "card" => $card,
                ]
            );
            return;
        }

        $slot = (int) $card["slot"];
        $card2 = $this->getMainInSlot($playerId, $slot);
        $cardId2 = (int) $card2["id"];
        $Scene2 = new Scene($this->game, $cardId2);

        $this->game->notify->all(
            "placeScene",
            clienttranslate('${player_name} attaches ${sceneLabel} to ${sceneLabel2}'),
            [
                "i18n" => ["sceneLabel", "sceneLabel2"],
                "preserve" => ["sceneId", "sceneId2"],
                "player_id" => $playerId,
                "sceneLabel" => $this->downLabel,
                "sceneId" => $this->id,
                "card" => $card,
                "sceneLabel2" => $Scene2->upLabel,
                "sceneId2" => $Scene2->id,
            ]
        );
    }

    public function isAttachable(int $playerId): bool
    {
        return $this->getMaxSlot($playerId) > 0 && $this->canPayCost($playerId);
    }

    public function attach(int $playerId, int $slot): void
    {
        if ($this->staffCost > 0) {
            $this->staffCounterPrivate->inc(
                $playerId,
                -$this->staffCost,
            );

            $this->game->notify->player(
                $playerId,
                "setCounterPrivate",
                "",
                [
                    "name" => "staff",
                    "inc" => -$this->staffCost,
                ]
            );
        }

        $position = $this->getNextPosition($playerId, $slot);
        $sql = "UPDATE {$this->dbTable} SET position={$position}, slot={$slot}, card_location='placed', card_location_arg={$playerId} 
        WHERE card_id={$this->cardId}";

        $this->game->DbQuery($sql);

        $card = $this->getCard($this->cardId);
        $card2 = $this->getMainInSlot($playerId, $slot);
        $cardId2 = (int) $card2["id"];
        $Scene2 = new Scene($this->game, $cardId2);

        $this->game->notify->player(
            $playerId,
            "placeScenePrivate",
            clienttranslate('You add ${sceneLabel} to ${sceneLabel2}'),
            [
                "i18n" => ["sceneLabel", "sceneLabel2"],
                "preserve" => ["sceneId", "sceneId2"],
                "sceneLabel" => $this->downLabel,
                "sceneId" => $this->id,
                "card" => $card,
                "sceneLabel2" => $Scene2->upLabel,
                "sceneId2" => $Scene2->id,
            ]
        );
    }

    public function discard(int $playerId): void
    {
        $card = $this->move("discard", $playerId);

        $this->game->notify->player(
            $playerId,
            "discardScenePrivate",
            clienttranslate('You discard ${sceneLabel} and get 2 ${staff_icon}'),
            [
                "i18n" => ["sceneLabel"],
                "preserve" => ["sceneId"],
                "sceneLabel" => $this->upLabel,
                "sceneId" => $this->id,
                "card" => $card,
            ]
        );

        $this->staffCounterPrivate->inc($playerId, 2);

        $this->game->notify->player(
            $playerId,
            "setCounterPrivate",
            "",
            [
                "name" => "staff",
                "inc" => 2,
            ]
        );
    }

    public function revealDiscarded(int $playerId): void
    {
        $card = $this->move("box");

        $this->game->notify->all(
            "discardScene",
            clienttranslate('${player_name} discards ${sceneLabel} and gets 2 ${staff_icon}'),
            [
                "i18n" => ["sceneLabel"],
                "preserve" => ["sceneId"],
                "player_id" => $playerId,
                "sceneLabel" => $this->upLabel,
                "sceneId" => $this->id,
                "card" => $card,
            ]
        );

        $this->staffCounter->inc($playerId, 2);
    }

    public function isDiscardable(int $playerId): bool
    {
        $card = $this->getCard($this->cardId);
        return $card["location"] === "hand" && (int) $card["location_arg"] === $playerId;
    }
}

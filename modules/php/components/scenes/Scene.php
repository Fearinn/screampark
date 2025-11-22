<?php

namespace Bga\Games\ScreamPark\components\scenes;

use Bga\Games\ScreamPark\Game;

class Scene extends Scenes
{
    private readonly int $cardId;
    public readonly int $id;
    public readonly string $type;
    public readonly int $points;
    public readonly int $staffCost;
    public readonly array $UP;
    public readonly array $DOWN;

    public function __construct(Game $game, int $cardId)
    {
        parent::__construct($game, $game->scene_cards, "scenes");
        $card = $this->getCard($cardId);
        $sceneId = (int) $card["type_arg"];

        $this->cardId = $cardId;
        $this->id = $sceneId;
        $this->type = $card["type"];
        $SCENE = $this->SCENES[$this->id];
        $this->UP = $SCENE["up"];
        $this->DOWN = $SCENE["down"];
        $this->points = (int) $this->UP["points"];
        $this->staffCost = (int) $this->DOWN["staffCost"];
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

    public function play(int $playerId): void
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

        $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='played', card_location_arg={$playerId}, 
        slot={$slot}, position=1 WHERE card_id={$this->cardId}");
        $card = $this->getCard($this->cardId);

        $this->game->notify->player(
            $playerId,
            "playScenePrivate",
            clienttranslate('You play ${scene_label} as a new scene'),
            [
                "i18n" => ["scene_label"],
                "preserve" => ["sceneId"],
                "scene_label" => $this->UP["label"],
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
                "playScene",
                clienttranslate('${player_name} plays ${scene_label} as a new scene'),
                [
                    "i18n" => ["scene_label"],
                    "preserve" => ["sceneId"],
                    "player_id" => $playerId,
                    "scene_label" => $this->UP["label"],
                    "sceneId" => $this->id,
                    "card" => $card,
                ]
            );
            return;
        }

        $slot = (int) $card["slot"];
        $card2 = $this->getMainInSlot($playerId, $slot);
        $sceneId2 = (int) $card2["type_arg"];

        $this->game->notify->all(
            "playScene",
            clienttranslate('${player_name} attaches ${scene_label} to ${scene_label2}'),
            [
                "i18n" => ["scene_label", "scene_label2"],
                "preserve" => ["sceneId", "sceneId2"],
                "player_id" => $playerId,
                "scene_label" => $this->DOWN["label"],
                "sceneId" => $this->id,
                "card" => $card,
                "scene_label2" => $this->SCENES[$sceneId2]["up"]["label"],
                "sceneId2" => $sceneId2,
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
        $sql = "UPDATE {$this->dbTable} SET position={$position}, slot={$slot}, card_location='played', card_location_arg={$playerId} 
        WHERE card_id={$this->cardId}";
        
        $this->game->DbQuery($sql);

        $card = $this->getCard($this->cardId);
        $card2 = $this->getMainInSlot($playerId, $slot);
        $sceneId2 = (int) $card2["type_arg"];

        $this->game->notify->player(
            $playerId,
            "playScenePrivate",
            clienttranslate('You attach ${scene_label} to ${scene_label2}'),
            [
                "i18n" => ["scene_label", "scene_label2"],
                "preserve" => ["sceneId", "sceneId2"],
                "scene_label" => $this->DOWN["label"],
                "sceneId" => $this->id,
                "card" => $card,
                "scene_label2" => $this->SCENES[$sceneId2]["up"]["label"],
                "sceneId2" => $sceneId2,
            ]
        );
    }

    public function discard(int $playerId): void
    {
        $card = $this->move("discard", $playerId);

        $this->game->notify->player(
            $playerId,
            "discardScenePrivate",
            clienttranslate('You discard ${scene_label} and get 2 ${staff_icon}'),
            [
                "i18n" => ["scene_label"],
                "preserve" => ["sceneId"],
                "scene_label" => $this->UP["label"],
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
            clienttranslate('${player_name} discards ${scene_label} and gets 2 ${staff_icon}'),
            [
                "i18n" => ["scene_label"],
                "preserve" => ["sceneId"],
                "player_id" => $playerId,
                "scene_label" => $this->UP["label"],
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

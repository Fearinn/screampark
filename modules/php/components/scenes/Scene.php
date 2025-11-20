<?php

namespace Bga\Games\ScreamPark\components\scenes;

use Bga\Games\ScreamPark\Game;

class Scene extends Scenes
{
    private readonly int $cardId;
    public readonly int $id;
    public readonly int $points;
    public readonly int $staffCost;
    private readonly array $UP;
    private readonly array $DOWN;

    public function __construct(Game $game, int $cardId)
    {
        parent::__construct($game, $game->scene_cards, "scenes");
        $card = $this->deck->getCard($cardId);
        $sceneId = (int) $card["type_arg"];

        $this->cardId = $cardId;
        $this->id = $sceneId;
        $SCENE = $this->SCENES[$this->id];
        $this->UP = $SCENE["up"];
        $this->DOWN = $SCENE["down"];
        $this->points = (int) $this->UP["points"];
        $this->staffCost = (int) $this->DOWN["staffCost"];
    }

    private function canPayCost(int $playerId): bool
    {
        return $this->staffCost <= $this->staffCounter->get($playerId);
    }

    public function isPlayable(int $playerId): bool
    {
        return $this->points >= $this->getMinPoints($playerId)
            && $this->canPayCost($playerId);
    }

    public function play(int $playerId): void
    {
        if ($this->staffCost > 0) {
            $this->staffCounter->inc(
                $playerId,
                -$this->staffCost,
            );
        }

        $slot = $this->getMaxSlot($playerId) + 1;

        $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='played', card_location_arg={$playerId}, 
        slot={$slot}, position=1 WHERE card_id={$this->cardId}");
        $card = $this->getCard($this->cardId);

        $this->game->notify->player(
            $playerId,
            "playScene",
            "",
            [
                "card" => $card,
            ]
        );
    }

    public function isAttachable(int $playerId): bool
    {
        return $this->getMaxSlot($playerId) > 0 && $this->canPayCost($playerId);
    }


    public function discard(int $playerId): void
    {
        $this->deck->moveCard($this->cardId, "discard", $playerId);
        $card = $this->getCard($this->cardId);

        $this->game->notify->player(
            $playerId,
            "discardScene",
            clienttranslate('${player_name} discards ${scene_label} and gets 2 ${staff_icon}'),
            [
                "i18n" => ["scene_label"],
                "preserve" => ["sceneId"],
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

<?php

namespace Bga\Games\ScreamPark\components\scenes;

use Bga\Games\ScreamPark\Game;

class Scene extends Scenes
{
    private readonly int $cardId;
    public readonly int $id;
    public readonly int $points;
    public readonly int $staffCost;

    public function __construct(Game $game, int $cardId)
    {
        parent::__construct($game, $game->scene_cards, "scenes");
        $card = $this->deck->getCard($cardId);
        $sceneId = (int) $card["type_arg"];

        $this->cardId = $cardId;
        $this->id = $sceneId;
        $SCENE = $this->SCENES[$this->id];
        $UP = $SCENE["up"];
        $DOWN = $SCENE["down"];
        $this->points = (int) $UP["points"];
        $this->staffCost = (int) $DOWN["staffCost"];
    }

    public function isPlayable(int $playerId): bool
    {
        return $this->points >= $this->getMinPoints($playerId)
            && $this->staffCost <= $this->staffCounter->get($playerId);
    }

    public function play(int $playerId): array
    {
        $slot = $this->getMaxSlot($playerId) + 1;

        $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='played', card_location_arg={$playerId}, 
        slot={$slot}, position=1 WHERE card_id={$this->cardId}");
        $card = $this->getCard($this->cardId);

        return $card;
    }
}

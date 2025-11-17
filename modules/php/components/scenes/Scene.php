<?php

namespace Bga\Games\ScreamPark\components\scenes;

use Bga\Games\ScreamPark\Game;

class Scene extends Scenes
{
    private readonly int $cardId;
    private readonly int $id;
    private readonly int $points;
    public function __construct(Game $game, int $cardId)
    {
        parent::__construct($game, $game->scene_cards, "scenes");
        $card = $this->deck->getCard($cardId);
        $sceneId = (int) $card["type_arg"];

        $this->cardId = $cardId;
        $this->id = $sceneId;
        $SCENE = $this->SCENES[$this->id];
        $this->points = (int) $SCENE["up"]["points"];
    }

    public function isPlayable(int $playerId): bool
    {
        return $this->points >= $this->getNextMinPoints($playerId);
    }

    public function play(int $playerId): array
    {
        $slot = $this->getMaxSlot($playerId) + 1;
        $position = $this->getNextPosition($playerId, $slot);

        $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='played', card_location_arg={$playerId}, 
        slot={$slot}, position={$position} WHERE card_id={$this->cardId}");
        $card = $this->getCard($this->cardId);

        return $card;
    }
}

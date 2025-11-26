<?php

namespace Bga\Games\ScreamPark\components\scenes;

use Bga\Games\ScreamPark\Game;

class Genre extends Scenes
{
    public readonly int $cardId;
    public readonly int $id;
    public readonly string $label;

    public function __construct(Game $game, int $cardId)
    {
        parent::__construct($game, $game->scene_cards, "scenes");
        $card = $this->getCard($cardId);
        $genreId = (int) $card["type_arg"];

        $this->cardId = $cardId;
        $this->id = $genreId;
        $this->label = $this->GENRES[$genreId]["label"];
    }

    private function move(string $location, int $location_arg = 0): array
    {
        $this->deck->moveCard($this->cardId, $location, $location_arg);
        return $this->getCard($this->cardId);
    }

    public function isAttachable(int $playerId): bool
    {
        return $this->getMaxSlot($playerId) > 0;
    }

    public function attach(int $playerId, int $slot): void
    {
        $position = $this->getNextPosition($playerId, $slot);

        $sql = "UPDATE {$this->dbTable} SET position={$position}, slot={$slot}, card_location='placed', 
        card_location_arg={$playerId} WHERE card_id={$this->cardId}";
        $this->game->DbQuery($sql);
        $card = $this->getCard($this->cardId);

        $Scene = $this->getMainInSlot($playerId, $slot);

        $this->game->notify->player(
            $playerId,
            "placeScenePrivate",
            clienttranslate('You add a ${genreLabel} card to ${sceneLabel}'),
            [
                "i18n" => ["genreLabel", "sceneLabel"],
                "preserve" => ["sceneId"],
                "genreLabel" => $this->label,
                "sceneLabel" => $Scene->upLabel,
                "sceneId" => $this->id,
                "card" => $card,
            ]
        );
    }

    public function revealAttached(int $playerId): void
    {
        $this->move("board", $playerId);
        $card = $this->getCard($this->cardId);
        $slot = (int) $card["slot"];

        $Scene = $this->getMainInSlot($playerId, $slot);

        $this->game->notify->all(
            "placeScene",
            clienttranslate('${player_name} adds a ${genreLabel} card to ${sceneLabel}'),
            [
                "i18n" => ["genreLabel", "sceneLabel"],
                "preserve" => ["genreId", "sceneId"],
                "player_id" => $playerId,
                "genreLabel" => $this->label,
                "genreId" => $this->id,
                "card" => $card,
                "sceneLabel" => $Scene->upLabel,
                "sceneId" => $Scene->id,
            ]
        );
    }
}

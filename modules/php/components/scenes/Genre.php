<?php

namespace Bga\Games\ScreamPark\components\scenes;

use Bga\Games\ScreamPark\Game;

class Genre extends Scenes
{
    private readonly int $cardId;
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
        $sql = "UPDATE {$this->dbTable} SET position={$position}, slot={$slot}, card_location='played', 
        card_location_arg={$playerId} WHERE card_id={$this->cardId}";

        $this->game->DbQuery($sql);

        $card = $this->getCard($this->cardId);
        $sceneId = (int) $card["type_arg"];

        $this->game->notify->player(
            $playerId,
            "playScenePrivate",
            clienttranslate('You attach a ${genre_label} card to ${scene_label}'),
            [
                "i18n" => ["genre_label", "scene_label"],
                "preserve" => ["sceneId"],
                "genre_label" => $this->label,
                "scene_label" => $this->SCENES[$sceneId]["up"]["label"],
                "sceneId" => $this->id,
                "card" => $card,
            ]
        );
    }
}

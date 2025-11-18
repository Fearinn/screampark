<?php

namespace Bga\Games\ScreamPark\components\scenes;

use Bga\GameFramework\Components\Counters\PlayerCounter;
use Bga\Games\ScreamPark\components\Cards;
use Bga\Games\ScreamPark\Game;

class Scenes extends Cards
{
    protected readonly array $SCENES;
    protected readonly array $GENRES;
    public readonly PlayerCounter $counter;

    public function __construct(Game $game)
    {
        parent::__construct($game, $game->scene_cards, "scenes");
        $this->SCENES = $this->game->SCENES;
        $this->GENRES = $this->game->GENRES;
        $this->cardFields = "card_id id, card_location location, card_location_arg location_arg, 
        card_type type, card_type_arg type_arg, slot, position";
    }

    public function setup(): void
    {

        $sceneCards = [];
        foreach ($this->SCENES as $sceneId => $scene) {
            $sceneCards[] = [
                "type" => "scene",
                "type_arg" => $sceneId,
                "nbr" => 1
            ];
        }
        $this->deck->createCards($sceneCards);
        $this->deck->shuffle("deck");

        $playerCount = $this->game->getPlayerCount();

        $genreCards = [];
        foreach ($this->GENRES as $genre_id => $genre) {
            $genreCards[] = [
                "type" => "genre",
                "type_arg" => $genre_id,
                "nbr" => 9 * $playerCount,
            ];
        }

        $this->deck->createCards($genreCards, "genreDeck");
    }

    protected function getCard(int $cardId): ?array
    {
        $card = $this->game->getObjectFromDB("SELECT {$this->cardFields} FROM {$this->dbTable} WHERE card_id={$cardId}");
        return $card;
    }

    public function getPublic(): array
    {
        $cards = $this->game->getObjectListFromDB("SELECT {$this->cardFields} FROM {$this->dbTable} 
        WHERE card_location='board' OR card_location='played'");
        return $cards;
    }

    public function getMaxSlot(int $playerId): int
    {
        $slot = (int) $this->game->getUniqueValueFromDB("SELECT MAX(slot) FROM {$this->dbTable} 
        WHERE (card_location='board' OR card_location='played') AND card_location_arg={$playerId} AND position=1");

        if (!$slot) {
            return 0;
        }

        return $slot;
    }

    public function getNextPosition(int $playerId, int $slot): int
    {
        $nextPosition = (int) $this->game->getUniqueValueFromDB("SELECT MAX(position) FROM {$this->dbTable}
        WHERE card_location='board' AND card_location_arg={$playerId} AND slot={$slot}");

        if (!$nextPosition) {
            return 1;
        }

        return $nextPosition;
    }

    protected function getNextMinPoints(int $playerId): int
    {
        $maxSlot = $this->getMaxSlot($playerId);

        if ($maxSlot === 0) {
            return 0;
        }

        $card = $this->getHead($playerId, $maxSlot);
        $sceneId = (int) $card["type_arg"];
        $SCENE = $this->SCENES[$sceneId];
        return (int) $SCENE["up"]["points"];
    }

    protected function getHead(int $playerId, int $slot): array
    {
        $sql = "SELECT {$this->cardFields} FROM {$this->dbTable} 
        WHERE (card_location='board' OR card_location='played') AND card_location_arg={$playerId} AND position=1 AND slot={$slot}";

        return $this->game->getObjectFromDB($sql);
    }

    public function getPlayable(int $playerId): array
    {
        $hand = $this->deck->getPlayerHand($playerId);

        $playableCards = [];
        foreach ($hand as $cardId => $card) {
            $Scene = new Scene($this->game, $cardId);

            if ($Scene->isPlayable($playerId)) {
                $playableCards[] = $cardId;
            }
        }

        return $playableCards;
    }
}

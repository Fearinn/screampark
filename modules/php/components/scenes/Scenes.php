<?php

namespace Bga\Games\ScreamPark\components\scenes;

use Bga\GameFramework\Components\Counters\PlayerCounter;
use Bga\Games\ScreamPark\components\Cards;
use Bga\Games\ScreamPark\Game;

class Scenes extends Cards
{
    protected readonly array $SCENES;
    protected readonly array $GENRES;
    protected readonly PlayerCounter $staffCounter;
    protected readonly PlayerCounter $staffCounterPrivate;

    public function __construct($game)
    {
        parent::__construct($game, $game->scene_cards, "scenes");
        $this->SCENES = $this->game->SCENES;
        $this->GENRES = $this->game->GENRES;
        $this->staffCounter = $this->game->staffCounter;
        $this->staffCounterPrivate = $this->game->staffCounterPrivate;
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
        foreach ($this->GENRES as $genreId => $genre) {
            $genreCards[] = [
                "type" => "genre",
                "type_arg" => $genreId,
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

    protected function getCards(array $cardIds): array
    {
        $cardIds = implode(",", $cardIds);
        $cards = $this->game->getObjectListFromDB("SELECT {$this->cardFields} FROM {$this->dbTable} 
        WHERE card_id IN ({$cardIds})");
        return $cards;
    }

    public function getPublic(): array
    {
        $cards = $this->game->getObjectListFromDB("SELECT {$this->cardFields} FROM {$this->dbTable} 
        WHERE card_location='board'");
        return $cards;
    }

    public function getBoard(int $playerId): array
    {
        $cards = $this->game->getObjectListFromDB("SELECT {$this->cardFields} FROM {$this->dbTable} 
        WHERE (card_location='board' OR card_location='played') AND card_location_arg={$playerId}");
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
        WHERE (card_location='board' OR card_location='played') AND card_location_arg={$playerId} AND slot={$slot}") + 1;

        if (!$nextPosition) {
            return 1;
        }

        return $nextPosition;
    }

    protected function getMinPoints(int $playerId): int
    {
        $maxSlot = $this->getMaxSlot($playerId);

        if ($maxSlot === 0) {
            return 0;
        }

        $card = $this->getMainInSlot($playerId, $maxSlot);
        $sceneId = (int) $card["type_arg"];
        $SCENE = $this->SCENES[$sceneId];
        return (int) $SCENE["UP"]["points"];
    }

    public function getMainInSlot(int $playerId, int $slot): array
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

    public function getAttachable(int $playerId): array
    {
        $hand = $this->deck->getPlayerHand($playerId);
        $attachableCards = [];

        foreach ($hand as $cardId => $card) {
            $Scene = new Scene($this->game, $cardId);

            if ($Scene->isAttachable($playerId)) {
                $attachableCards[] = $cardId;
            }
        }

        return $attachableCards;
    }

    public function discardBoth(int $playerId, array $cardIds): void
    {
        $this->deck->moveCards($cardIds, "todiscard", $playerId);
        // $cards = $this->getCards($cardIds);

        // [$cardId, $cardId2] = $cardIds;
        // $Scene = new Scene($this->game, $cardId);
        // $Scene2 = new Scene($this->game, $cardId2);

        // $this->game->notify->player(
        //     $playerId,
        //     "discardBoth",
        //     clienttranslate('You discard ${sceneLabel} and ${sceneLabel2} to pick a genre card'),
        //     [
        //         "i18n" => ["sceneLabel", "sceneLabel2"],
        //         "preserve" => ["sceneId", "sceneId2"],
        //         "sceneLabel" => $Scene->upLabel,
        //         "sceneLabel2" => $Scene2->upLabel,
        //         "sceneId" => $Scene->id,
        //         "sceneId2" => $Scene2->id,
        //         "cards" => $cards,
        //     ]
        // );
    }

    public function getGenre(int $genreId): Genre
    {
        $sql = "SELECT card_id FROM {$this->dbTable} WHERE card_location='genreDeck' AND card_type='genre' AND card_type_arg={$genreId} LIMIT 1";
        $cardId = (int) $this->game->getUniqueValueFromDB($sql);
        $Genre = new Genre($this->game, $cardId);
        return $Genre;
    }
}

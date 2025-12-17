<?php

namespace Bga\Games\ScreamPark\components\scenes;

use Bga\GameFramework\Components\Counters\PlayerCounter;
use Bga\Games\ScreamPark\components\Cards;
use Bga\Games\ScreamPark\components\vips\Vips;
use Bga\Games\ScreamPark\Game;

class Scenes extends Cards
{
    protected readonly array $SCENES;
    protected readonly array $GENRES;
    protected readonly PlayerCounter $staffCounter;
    protected readonly PlayerCounter $staffCounterPrivate;
    protected readonly PlayerCounter $draftCounter;
    protected readonly PlayerCounter $playerScore;
    protected readonly Vips $vips;

    public function __construct(Game $game)
    {
        parent::__construct($game, $game->scene_cards, "scenes");
        $this->SCENES = $this->game->SCENES;
        $this->GENRES = $this->game->GENRES;
        $this->staffCounter = $this->game->staffCounter;
        $this->staffCounterPrivate = $this->game->staffCounterPrivate;
        $this->draftCounter = $this->game->draftCounter;
        $this->playerScore = $this->game->playerScore;

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

    protected function getCards(array $cardsIds): array
    {
        $cardsIds = implode(",", $cardsIds);
        $cards = $this->game->getObjectListFromDB("SELECT {$this->cardFields} FROM {$this->dbTable} 
        WHERE card_id IN ({$cardsIds})");
        return $cards;
    }

    public function getPublic(?int $excludedPlayerId = null): array
    {
        $sql = "SELECT {$this->cardFields} FROM {$this->dbTable} WHERE card_location IN ('board')";

        if ($excludedPlayerId) {
            $sql .= " AND card_location_arg<>{$excludedPlayerId}";
        }

        $cards = $this->game->getObjectListFromDB($sql);
        return $cards;
    }

    public function getHand(int $playerId): array
    {
        $sql = "SELECT {$this->cardFields} FROM {$this->dbTable} 
        WHERE card_location IN ('hand', 'todiscard') AND card_location_arg={$playerId}";
        $hand = $this->game->getObjectListFromDB($sql);

        return $hand;
    }

    public function getBoard(int $playerId): array
    {
        $sql = "SELECT {$this->cardFields} FROM {$this->dbTable} 
        WHERE card_location IN ('board', 'placed', 'placedAnywhere') AND card_location_arg={$playerId}";
        $board = $this->game->getObjectListFromDB($sql);

        return $board;
    }

    public function getMaxSlot(int $playerId): int
    {
        $slot = (int) $this->game->getUniqueValueFromDB("SELECT MAX(slot) FROM {$this->dbTable} 
        WHERE card_location IN ('board', 'placed', 'placedAnywhere') AND card_location_arg={$playerId} AND position=1");

        if (!$slot) {
            return 0;
        }

        return $slot;
    }

    public function getNextPosition(int $playerId, int $slot): int
    {
        $nextPosition = (int) $this->game->getUniqueValueFromDB("SELECT MAX(position) FROM {$this->dbTable}
        WHERE card_location IN ('board', 'placed', 'placedAnywhere') AND card_location_arg={$playerId} AND slot={$slot}") + 1;

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

        $Scene = $this->getMainInSlot($playerId, $maxSlot);
        if (!$Scene) {
            return 0;
        }

        $sceneId = $Scene->id;
        $SCENE = $this->SCENES[$sceneId];
        return (int) $SCENE["UP"]["points"];
    }

    public function getMainInSlot(int $playerId, int $slot): ?Scene
    {
        $sql = "SELECT {$this->cardFields} FROM {$this->dbTable} 
        WHERE card_location IN ('board', 'placed', 'placedAnywhere') AND card_location_arg={$playerId} 
        AND position=1 AND slot={$slot}";

        $card = $this->game->getObjectFromDB($sql);
        if (!$card) {
            return null;
        }

        $cardId = (int) $card["id"];
        return new Scene($this->game, $cardId);
    }

    public function getPlaceable(int $playerId): array
    {
        $hand = $this->deck->getPlayerHand($playerId);

        $placeable = [];
        foreach ($hand as $cardId => $card) {
            $Scene = new Scene($this->game, $cardId);

            if ($Scene->isPlaceable($playerId)) {
                $placeable[] = $cardId;
            }
        }

        return $placeable;
    }

    public function getPlaceableAnywhere(int $playerId): array
    {
        $hand = $this->deck->getPlayerHand($playerId);

        $placeable = [];
        foreach ($hand as $cardId => $card) {
            $Scene = new Scene($this->game, $cardId);

            if ($Scene->isPlaceableAnywhere($playerId)) {
                $placeable[] = $cardId;
            }
        }

        return $placeable;
    }

    public function getAttachable(int $playerId): array
    {
        $hand = $this->deck->getPlayerHand($playerId);
        $attachable = [];

        foreach ($hand as $cardId => $card) {
            $Scene = new Scene($this->game, $cardId);

            if ($Scene->isAttachable($playerId)) {
                $attachable[] = $cardId;
            }
        }

        return $attachable;
    }

    public function getGenre(int $genreId): Genre
    {
        $sql = "SELECT card_id FROM {$this->dbTable} WHERE card_location='genreDeck' AND card_type='genre' 
        AND card_type_arg={$genreId} LIMIT 1";
        $cardId = (int) $this->game->getUniqueValueFromDB($sql);
        $Genre = new Genre($this->game, $cardId);

        return $Genre;
    }

    public function revealDiscardedBoth(int $playerId): void
    {
        $cards = $this->deck->getCardsInLocation("discardboth", $playerId);
        if (count($cards) !== 2) {
            return;
        }

        $cardsIds = array_keys($cards);
        [$cardId, $cardId2] = $cardsIds;

        $Scene = new Scene($this->game, $cardId);
        $Scene2 = new Scene($this->game, $cardId2);

        $this->game->notify->all(
            "discardBoth",
            clienttranslate('${player_name} discards ${sceneLabel} and ${sceneLabel2} to pick a genre card'),
            [
                "i18n" => ["sceneLabel", "sceneLabel2"],
                "preserve" => ["sceneId", "sceneId2"],
                "player_id" => $playerId,
                "sceneLabel" => $Scene->upLabel,
                "sceneLabel2" => $Scene2->upLabel,
                "sceneId" => $Scene->id,
                "sceneId2" => $Scene2->id,
                "cards" => array_values($cards),
            ]
        );
    }

    public function countCardsInSlot(int $playerId, int $slot): int
    {
        $sql = "SELECT COUNT(card_id) FROM {$this->dbTable} WHERE card_location IN ('board', 'placed', 'placedAnywhere') 
        AND card_location_arg={$playerId} AND slot={$slot}";

        return (int) $this->game->getUniqueValueFromDB($sql);
    }

    public function getScenesInSlot(int $playerId, int $slot): array
    {
        $sql = "SELECT {$this->cardFields} FROM {$this->dbTable} WHERE card_type='scene' 
        AND card_location IN ('board', 'placed', 'placedAnywhere') AND card_location_arg={$playerId} AND slot={$slot}";

        $Scenes = [];
        $cards = $this->game->getCollectionFromDB($sql);
        foreach ($cards as $cardId => $card) {
            $Scenes[] = new Scene($this->game, $cardId);
        }

        return $Scenes;
    }

    private function getGenresInSlot(int $playerId, int $slot): array
    {
        $sql = "SELECT {$this->cardFields} FROM {$this->dbTable} WHERE card_type='genre' AND 
        card_location IN ('board', 'placed', 'placedAnywhere') AND card_location_arg={$playerId} AND slot={$slot}";

        $Genres = [];
        $cards = $this->game->getCollectionFromDB($sql);
        foreach ($cards as $cardId => $card) {
            $Genres[] = new Genre($this->game, $cardId);
        }
        return $Genres;
    }

    public function sumSlotGenres(int $playerId, int $slot): array
    {
        $genres = array_fill(1, 5, 0);
        $Scenes = $this->getScenesInSlot($playerId, $slot);

        foreach ($Scenes as $Scene) {
            foreach ($Scene->genres as $genreId => $value) {
                $genres[$genreId] += $value;
            }
        }

        $Genres = $this->getGenresInSlot($playerId, $slot);
        foreach ($Genres as $Genre) {
            $genres[$Genre->id] += 1;
        }

        return $genres;
    }

    public function shift(int $playerId, int $slot): void
    {
        $sql = "UPDATE {$this->dbTable} SET slot=slot+1, shifted=1 WHERE card_location_arg={$playerId} 
        AND card_location IN ('board', 'placed', 'placedAnywhere') AND slot>={$slot}";
        $this->game->DbQuery($sql);

        $sql = "SELECT {$this->cardFields} FROM {$this->dbTable} 
        WHERE shifted=1 AND card_location_arg={$playerId} ORDER BY slot DESC, position";
        $cards = $this->game->getObjectListFromDB($sql);

        $this->game->notify->player(
            $playerId,
            "shiftScenesPrivate",
            "",
            [
                "cards" => $cards,
            ]
        );
    }

    public function revealShifted(int $playerId, int $slot): void
    {
        $sql = "UPDATE {$this->dbTable} SET shifted=0 WHERE shifted=1 AND card_location_arg={$playerId}";
        $this->game->DbQuery($sql);

        $sql = "SELECT {$this->cardFields} FROM {$this->dbTable} 
        WHERE slot>$slot AND card_location_arg={$playerId} ORDER BY slot DESC, position";
        $cards = $this->game->getObjectListFromDB($sql);

        $this->game->notify->all(
            "shiftScenes",
            "",
            [
                "player_id" => $playerId,
                "cards" => $cards,
            ]
        );
    }

    public function countSlotWilds(int $playerId, int $slot): int
    {
        $wildCount = 0;

        $Scenes = $this->getScenesInSlot($playerId, $slot);
        foreach ($Scenes as $Scene) {
            if ($Scene->ability === 3) {
                $wildCount++;
            }
        }

        return $wildCount;
    }

    public function getVipFulfilling(): array
    {
        if ($this->game->dayCounter->get() > 3) {
            return [];
        }

        $players = $this->game->loadPlayersBasicInfos();
        $Vips = new Vips($this->game);
        $cardsIds = [];

        foreach ($players as $playerId => $player) {
            $slot[$playerId] = [];
            $maxSlot = $this->getMaxSlot($playerId);

            for ($slot = 1; $slot <= $maxSlot; $slot++) {
                if (!$Vips->isFulfilled($playerId, $slot)) {
                    continue;
                }

                $Scene = $this->getMainInSlot($playerId, $slot);
                $cardsIds[] = $Scene->cardId;
            }
        }

        return $cardsIds;
    }
}

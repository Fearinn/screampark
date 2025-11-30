<?php

namespace Bga\Games\ScreamPark\components;

use Bga\GameFramework\Components\Deck;
use Bga\Games\ScreamPark\Game;

class Cards
{
    protected readonly Game $game;
    public readonly Deck $deck;
    public readonly string $dbTable;
    public string $cardFields;

    public function __construct(
        Game $game,
        Deck $deck,
        string $dbTable
    ) {
        $this->game = $game;
        $this->deck = $deck;
        $this->dbTable = $dbTable;
        $this->cardFields = "card_id id, card_location location, card_location_arg location_arg, 
        card_type type, card_type_arg type_arg";
    }

    public function getHand(int $player_id): array
    {
        $hand = $this->deck->getPlayerHand($player_id);
        return array_values($hand);
    }

    public function getHandCount(int $player_id): int
    {
        return $this->deck->countCardsInLocation("hand", $player_id);
    }

    public function getHandsCounts(): array
    {
        $handsCounts = [];
        $players = $this->game->loadPlayersBasicInfos();

        foreach ($players as $player_id => $player) {
            $handsCounts[$player_id] = $this->deck->countCardsInLocation("hand", $player_id);
        }

        return $handsCounts;
    }

    public function getDeck(): array
    {
        $cards = $this->deck->getCardsInLocation("deck");
        return array_values($cards);
    }

    public function getDeckCount(): int
    {
        $deckCount = (int) $this->deck->countCardsInLocation("deck");
        return $deckCount;
    }

    public function getPublic(?int $excludedPlayerId = null): array
    {
        $sql = "SELECT {$this->cardFields} FROM {$this->dbTable} 
        WHERE card_location<>'deck' AND card_location<>'hand' AND card_location<>'box'";

        if ($excludedPlayerId) {
            $sql .= " AND card_location_arg<>{$excludedPlayerId}";
        }

        $cards = $this->game->getObjectListFromDB($sql);
        return $cards;
    }

    public function hideCards(array $cards, array $hiddenProperties): array
    {
        $cards = array_map(function ($card) use ($hiddenProperties) {
            foreach ($hiddenProperties as $property) {
                unset($card, $property);
            }
        }, $cards);

        return $cards;
    }
}

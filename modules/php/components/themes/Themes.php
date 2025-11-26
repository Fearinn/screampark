<?php

namespace Bga\Games\ScreamPark\components\themes;

use Bga\Games\ScreamPark\components\Cards;
use Bga\Games\ScreamPark\Game;

class Themes extends Cards
{
    private readonly array $THEMES;

    public function __construct(Game $game)
    {
        parent::__construct($game, $game->theme_cards, "themes");
        $this->THEMES = $this->game->THEMES;
    }

    public function setup(): void
    {
        $cards = [];
        foreach ($this->THEMES as $theme_id => $theme) {
            $cards[] = [
                "type" => "theme",
                "type_arg" => $theme_id,
                "nbr" => 1
            ];
        }
        $this->deck->createCards($cards);
        $this->deck->shuffle("deck");

        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $player_id => $player) {
            $this->deck->pickCards(2, "deck", $player_id);
        }
    }

    public function getHands(int $currentPlayerId): array
    {
        $hands = [];

        $players = $this->game->loadPlayersBasicInfos();

        foreach ($players as $player_id => $player) {
            if ($currentPlayerId === $player_id) {
                $hand = $this->getHand($player_id);
            } else {
                $sql = "SELECT card_id id, card_location location, card_location_arg location_arg FROM {$this->dbTable} 
                WHERE card_location='hand' AND card_location_arg={$player_id}";
                $hand = $this->game->getObjectListFromDB($sql);
            }

            $hands = array_merge($hands, $hand);
        }

        return $hands;
    }

    public function getCost(int $playerId): array
    {
        $sql = "SELECT card_type_arg FROM {$this->dbTable} WHERE card_location='board' AND card_location_arg={$playerId}";
        $themeId = (int) $this->game->getUniqueValueFromDB($sql);
        return $this->THEMES[$themeId]["genreCost"];
    }
}

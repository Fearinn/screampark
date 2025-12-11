<?php

namespace Bga\Games\ScreamPark\components\vips;

use Bga\Games\ScreamPark\components\Cards;
use Bga\Games\ScreamPark\components\scenes\Scene;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\components\themes\Themes;
use Bga\Games\ScreamPark\Game;

class Vips extends Cards
{
    private readonly array $VIPS;
    private readonly Scenes $scenes;

    public function __construct(Game $game)
    {
        parent::__construct($game, $game->vip_cards, "vips");
        $this->VIPS = $this->game->VIPS;
        $this->scenes = new Scenes($this->game);
    }

    public function setup(): void
    {
        $cards = [];
        foreach ($this->VIPS as $vipId => $vip) {
            $cards[] = [
                "type" => $vip["name"],
                "type_arg" => $vipId,
                "nbr" => 1
            ];
        }
        $this->deck->createCards($cards);
        $this->deck->shuffle("deck");

        for ($day = 1; $day <= 3; $day++) {
            $this->deck->pickCardForLocation("deck", "board", $day);
        }
    }

    public function getActive(): int
    {
        $day = $this->game->dayCounter->get();

        $sql = "SELECT card_type_arg FROM {$this->dbTable} WHERE card_location='board' AND card_location_arg={$day}";
        $vipId = (int) $this->game->getUniqueValueFromDB($sql);

        return $vipId;
    }

    public function isFullfilled(int $playerId, int $slot): bool
    {
        $Scenes = $this->scenes->getScenesInSlot($playerId, $slot);
        foreach ($Scenes as $Scene) {
            if ($Scene->ability === 1) {
                return true;
            }
        }

        $vipId = $this->getActive();

        return match ($vipId) {
            1 => $this->HauntBrat($playerId, $slot),
            2 => $this->NewInvestor($playerId, $slot),
            3 => $this->LocalCelebrity($playerId, $slot),
            4 => $this->NewsCrew($playerId, $slot),
            5 => $this->PoliceChief($playerId, $slot),
            6 => $this->ReviewBlogger($playerId, $slot),
            7 => $this->TownBoardMember($playerId, $slot),
            8 => $this->SecretShopper($playerId, $slot),
            9 => $this->BirthdayParty($playerId, $slot),
            10 => $this->FireMarshal($playerId, $slot),
        };
    }

    private function HauntBrat(int $playerId, int $slot): bool
    {
        $Scene = $this->scenes->getMainInSlot($playerId, $slot);

        $genreCost = $Scene->genreCost;
        $genres = $this->scenes->sumSlotGenres($playerId, $slot);
        foreach ($genres as $genreId => $value) {
            $genreCost[$genreId] -= $value;
        }

        $excess = array_reduce($genreCost, function ($carry, $cost) {
            return $carry - $cost;
        }, 0);

        return $excess >= 2;
    }

    private function NewInvestor(int $playerId, int $slot): bool
    {
        $Scenes = $this->scenes->getScenesInSlot($playerId, $slot);

        return array_any($Scenes, function (Scene $Scene) {
            return $Scene->scenic > 0;
        });
    }

    private function LocalCelebrity(int $playerId, int $slot): bool
    {
        $Themes = new Themes($this->game);
        $genreIds = $Themes->getCost($playerId);
        $genres = $this->scenes->sumSlotGenres($playerId, $slot);

        return array_all($genreIds, function ($genreId) use ($genres) {
            return $genres[$genreId] > 0;
        });
    }

    private function NewsCrew(int $playerId, int $slot): bool
    {
        $cardCount = $this->scenes->countCardsInSlot($playerId, $slot);
        return $cardCount >= 3;
    }

    private function PoliceChief(int $playerId, int $slot): bool
    {
        $Scenes = $this->scenes->getScenesInSlot($playerId, $slot);

        return array_any($Scenes, function (Scene $Scene) {
            return $Scene->ability > 0;
        });
    }

    private function ReviewBlogger(int $playerId, int $slot): bool
    {
        $Scene = $this->scenes->getMainInSlot($playerId, $slot);
        return $Scene->isComplete();
    }

    private function TownBoardMember(int $playerId, int $slot): bool
    {
        $genres = $this->scenes->sumSlotGenres($playerId, $slot);

        $different = 0;
        foreach ($genres as $genreId => $value) {
            if ($value > 0) {
                $different++;
            }
        }

        return $different >= 3;
    }

    private function SecretShopper(int $playerId, int $slot): bool
    {
        $Scenes = $this->scenes->getScenesInSlot($playerId, $slot);
        return array_any($Scenes, function (Scene $Scene) {
            return $Scene->staffCost > 0;
        });
    }

    private function BirthdayParty(int $playerId, int $slot): bool
    {
        $genres = $this->scenes->sumSlotGenres($playerId, $slot);
        return array_any($genres, function ($value) {
            return $value >= 2;
        });
    }

    private function FireMarshal(int $playerId, int $slot): bool
    {
        $Scene = $this->scenes->getMainInSlot($playerId, $slot);
        return !$Scene->isComplete();
    }
}

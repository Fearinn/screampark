<?php

namespace Bga\Games\ScreamPark\components\scenes;

use Bga\GameFramework\NotificationMessage;
use Bga\Games\ScreamPark\components\themes\Themes;
use Bga\Games\ScreamPark\components\vips\Vips;
use Bga\Games\ScreamPark\Game;

class Scene extends Scenes
{
    public readonly array $GENRES;
    public readonly array $card;
    private readonly int $cardId;
    public readonly int $id;
    public readonly int $points;
    public readonly string $upLabel;
    public readonly string $downLabel;
    public readonly array $genreCost;
    public readonly array $genres;
    public readonly int $staffCost;
    public readonly int $ability;
    public readonly int $scenic;

    public function __construct(Game $game, int $cardId)
    {
        parent::__construct($game, $game->scene_cards, "scenes");

        $this->card = $this->getCard($cardId);
        $sceneId = (int) $this->card["type_arg"];

        $this->cardId = $cardId;
        $this->id = $sceneId;

        $SCENE = $this->SCENES[$this->id];
        $UP = $SCENE["UP"];
        $DOWN = $SCENE["DOWN"];
        $this->points = (int) $UP["points"];
        $this->upLabel = $UP["label"];
        $this->downLabel = $DOWN["label"];
        $this->genreCost = $UP["genreCost"];
        $this->genres = $DOWN["genres"];
        $this->ability = (int) $DOWN["ability"];
        $this->staffCost = (int) $DOWN["staffCost"];
        $this->scenic = (int) $DOWN["scenic"];
    }

    private function move(string $location, int $location_arg = 0): array
    {
        $this->deck->moveCard($this->cardId, $location, $location_arg);
        return $this->getCard($this->cardId);
    }

    private function canPayCost(int $playerId): bool
    {
        return $this->staffCost <= $this->staffCounterPrivate->get($playerId);
    }

    public function updateStaff(int $playerId): void
    {
        if ($this->staffCost > 0) {
            $this->staffCounter->inc(
                $playerId,
                -$this->staffCost,
                new NotificationMessage("", ["ignore" => true])
            );
        }

        if ($this->ability === 4) {
            $this->staffCounter->inc(
                $playerId,
                1,
                new NotificationMessage("", ["ignore" => true])
            );
        }
    }

    private function updateStaffPrivate(int $playerId): void
    {
        if ($this->staffCost > 0) {
            $this->staffCounterPrivate->inc($playerId, -$this->staffCost);

            $this->game->notify->player(
                $playerId,
                "setPlayerCounterPrivate",
                "",
                [
                    "name" => "staff",
                    "inc" => -$this->staffCost,
                ]
            );
        }

        if ($this->ability === 4) {
            $this->staffCounterPrivate->inc($playerId, 1);

            $this->game->notify->player(
                $playerId,
                "setPlayerCounterPrivate",
                "",
                [
                    "name" => "staff",
                    "inc" => 1,
                ]
            );
        }
    }

    public function isPlaceable(int $playerId): bool
    {
        return $this->points >= $this->getMinPoints($playerId)
            && $this->canPayCost($playerId);
    }

    public function place(int $playerId): void
    {
        $this->updateStaffPrivate($playerId);

        $slot = $this->getMaxSlot($playerId) + 1;

        $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='placed', card_location_arg={$playerId}, 
        slot={$slot}, position=1 WHERE card_id={$this->cardId}");
        $card = $this->getCard($this->cardId);

        $this->game->notify->player(
            $playerId,
            "placeScenePrivate",
            clienttranslate('You place ${sceneLabel} as a new scene'),
            [
                "i18n" => ["sceneLabel"],
                "preserve" => ["sceneId"],
                "sceneLabel" => $this->upLabel,
                "sceneId" => $this->id,
                "card" => $card,
            ]
        );
    }

    public function revealPlaced(int $playerId): void
    {
        $this->updateStaff($playerId);

        $card = $this->move("board", $playerId);
        $position = (int) $card["position"];

        if ($position === 1) {
            $this->game->notify->all(
                "placeScene",
                clienttranslate('${player_name} places ${sceneLabel} as a new scene'),
                [
                    "i18n" => ["sceneLabel"],
                    "preserve" => ["sceneId"],
                    "player_id" => $playerId,
                    "sceneLabel" => $this->upLabel,
                    "sceneId" => $this->id,
                    "card" => $card,
                ]
            );
            return;
        }

        $slot = (int) $card["slot"];
        $Scene2 = $this->getMainInSlot($playerId, $slot);

        $this->game->notify->all(
            "placeScene",
            clienttranslate('${player_name} adds ${sceneLabel} to ${sceneLabel2}'),
            [
                "i18n" => ["sceneLabel", "sceneLabel2"],
                "preserve" => ["sceneId", "sceneId2"],
                "player_id" => $playerId,
                "sceneLabel" => $this->downLabel,
                "sceneId" => $this->id,
                "card" => $card,
                "sceneLabel2" => $Scene2->upLabel,
                "sceneId2" => $Scene2->id,
            ]
        );
    }

    public function isPlaceableAnywhere(int $playerId): bool
    {
        return $this->points <= $this->getMinPoints($playerId) &&
            $this->canPayCost($playerId);
    }

    public function possibleAnywhereSlots(int $playerId): array
    {
        $possibleSlots = [];

        $maxSlot = $this->getMaxSlot($playerId);
        for ($slot = 1; $slot <= $maxSlot; $slot++) {
            $Scene = $this->getMainInSlot($playerId, $slot);

            if ($this->points <= $Scene->points) {
                $possibleSlots[] = $slot;
            }
        }

        return $possibleSlots;
    }

    public function placeAnywhere(int $playerId, int $slot): void
    {
        $this->updateStaffPrivate($playerId);
        $this->shift($playerId, $slot);

        $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='placed', card_location_arg={$playerId}, 
        slot={$slot}, position=1 WHERE card_id={$this->cardId}");
        $card = $this->getCard($this->cardId);
    }

    public function isAttachable(int $playerId): bool
    {
        return $this->getMaxSlot($playerId) > 0 && $this->canPayCost($playerId);
    }

    public function attach(int $playerId, int $slot): void
    {
        $this->updateStaffPrivate($playerId);

        $position = $this->getNextPosition($playerId, $slot);
        $sql = "UPDATE {$this->dbTable} SET position={$position}, slot={$slot}, card_location='placed', 
        card_location_arg={$playerId} WHERE card_id={$this->cardId}";

        $this->game->DbQuery($sql);

        $card = $this->getCard($this->cardId);
        $Scene2 = $this->getMainInSlot($playerId, $slot);

        $this->game->notify->player(
            $playerId,
            "placeScenePrivate",
            clienttranslate('You add ${sceneLabel} to ${sceneLabel2}'),
            [
                "i18n" => ["sceneLabel", "sceneLabel2"],
                "preserve" => ["sceneId", "sceneId2"],
                "sceneLabel" => $this->downLabel,
                "sceneId" => $this->id,
                "card" => $card,
                "sceneLabel2" => $Scene2->upLabel,
                "sceneId2" => $Scene2->id,
            ]
        );
    }

    public function discard(int $playerId): void
    {
        $card = $this->move("discard", $playerId);

        $this->game->notify->player(
            $playerId,
            "discardScenePrivate",
            clienttranslate('You discard ${sceneLabel} and get 2 ${staff_icon}'),
            [
                "i18n" => ["sceneLabel"],
                "preserve" => ["sceneId"],
                "sceneLabel" => $this->upLabel,
                "sceneId" => $this->id,
                "card" => $card,
            ]
        );

        $this->staffCounterPrivate->inc($playerId, 2);

        $this->game->notify->player(
            $playerId,
            "setPlayerCounterPrivate",
            "",
            [
                "name" => "staff",
                "inc" => 2,
            ]
        );
    }

    public function revealDiscarded(int $playerId): void
    {
        $card = $this->move("box");

        $this->game->notify->all(
            "discardScene",
            clienttranslate('${player_name} discards ${sceneLabel} and gets 2 ${staff_icon}'),
            [
                "i18n" => ["sceneLabel"],
                "preserve" => ["sceneId"],
                "player_id" => $playerId,
                "sceneLabel" => $this->upLabel,
                "sceneId" => $this->id,
                "card" => $card,
            ]
        );

        $this->staffCounter->inc(
            $playerId,
            2,
            new NotificationMessage("", ["ignore" => true]),
        );
    }

    public function isDiscardable(int $playerId): bool
    {
        $card = $this->getCard($this->cardId);
        return $card["location"] === "hand" && (int) $card["location_arg"] === $playerId;
    }

    public function isComplete(int $playerId): bool
    {
        $slot = (int) $this->card["slot"];
        $genreCost = $this->genreCost;

        $genres = $this->sumSlotGenres($playerId, $slot);
        foreach ($genres as $genreId => $value) {
            $genreCost[$genreId] -= $value;
        }

        $totalCost = array_reduce($genreCost, function ($carry, $cost) {
            return $carry + $cost;
        });

        return $totalCost <= $this->countSlotWilds($playerId, $slot);
    }

    public function scoreTheme(int $playerId): int
    {
        $points = 0;
        $slot = (int) $this->card["slot"];

        $Themes = new Themes($this->game);
        $genreIds = $Themes->getCost($playerId);
        $genres = $this->sumSlotGenres($playerId, $slot);

        foreach ($genreIds as $genreId) {
            if ($genres[$genreId] > 0) {
                $points += 1;
            }
        }
        $this->playerScore->inc($playerId, $points);

        return $points;
    }

    public function scoreVip(int $playerId): int
    {
        $slot = (int) $this->card["slot"];
        $Vips = new Vips($this->game);

        $points = $Vips->isFullfilled($playerId, $slot) ? 2 : 0;
        $this->playerScore->inc($playerId, $points);

        if ($points > 0) {
            $this->game->notify->all(
                "scoreVip",
                "",
                [
                    "player_id" => $playerId,
                    "card" => $this->card,
                ]
            );
        }

        return $points;
    }
}

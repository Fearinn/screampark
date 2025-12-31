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
    public readonly int $cardId;
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

    private function canPayCost(int $playerId, ?bool $anywhere = false): bool
    {
        $staffCost = $this->staffCost;
        if ($anywhere) {
            $staffCost++;
        }

        return $staffCost <= $this->staffCounterPrivate->get($playerId);
    }

    public function updateStaff(int $playerId, ?bool $anywhere = false): void
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

        if ($anywhere) {
            $this->staffCounter->inc(
                $playerId,
                -1,
                new NotificationMessage("", ["ignore" => true])
            );
        }
    }

    private function updateStaffPrivate(int $playerId, ?bool $anywhere = false): void
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

        if ($anywhere) {
            $this->staffCounterPrivate->inc($playerId, -1);
            $this->game->notify->player(
                $playerId,
                "setPlayerCounterPrivate",
                "",
                [
                    "name" => "staff",
                    "inc" => -1,
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
        $draft = $this->draftCounter->get($playerId) + 1;

        $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='placed', card_location_arg={$playerId}, 
        slot={$slot}, position=1, draft={$draft} WHERE card_id={$this->cardId}");
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

        $this->updateVipFulfilling($playerId);
        $this->updateScenicsPrivate($playerId);
        $this->updateAbilityPrivate($playerId);
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
            $this->canPayCost($playerId, true);
    }

    public function getSelectableAnywhereSlots(int $playerId): array
    {
        $selectableSlots = [];
        $maxSlot = $this->getMaxSlot($playerId);

        for ($slot = 1; $slot <= $maxSlot; $slot++) {
            $Scene = $this->getMainInSlot($playerId, $slot);

            if ($this->points <= $Scene->points) {
                $selectableSlots[] = $slot;
            }

            if ($this->points < $Scene->points) {
                break;
            }
        }

        return $selectableSlots;
    }

    public function placeAnywhere(int $playerId, int $slot): void
    {
        $this->updateStaffPrivate($playerId, true);
        $this->shift($playerId, $slot);
        $draft = $this->draftCounter->get($playerId) + 1;

        $this->game->DbQuery("UPDATE {$this->dbTable} SET card_location='placedAnywhere', card_location_arg={$playerId}, 
        slot={$slot}, position=1, draft={$draft} WHERE card_id={$this->cardId}");
        $card = $this->getCard($this->cardId);

        $Scene2 = $this->getMainInSlot($playerId, $slot + 1);

        $this->game->notify->player(
            $playerId,
            "placeScenePrivate",
            clienttranslate('You place ${sceneLabel} as a new scene to the left of ${sceneLabel2}'),
            [
                "i18n" => ["sceneLabel", "sceneLabel2"],
                "preserve" => ["sceneId", "sceneId2"],
                "sceneLabel" => $this->upLabel,
                "sceneId" => $this->id,
                "card" => $card,
                "sceneLabel2" => $Scene2->upLabel,
                "sceneId2" => $Scene2->id,
            ]
        );

        $this->updateVipFulfilling($playerId);
        $this->updateScenicsPrivate($playerId);
        $this->updateAbilityPrivate($playerId);
    }

    public function revealPlacedAnywhere(int $playerId): void
    {
        $this->updateStaff($playerId, true);

        $slot = (int) $this->card["slot"];
        $this->revealShifted($playerId, $slot);

        $this->move("board", $playerId);
        $card = $this->getCard($this->cardId);
        $slot = (int) $card["slot"];

        $Scene2 = $this->getMainInSlot($playerId, $slot + 1);

        $this->game->notify->all(
            "placeScene",
            clienttranslate('${player_name} places ${sceneLabel} to the left of ${sceneLabel2}'),
            [
                "i18n" => ["sceneLabel", "sceneLabel2"],
                "preserve" => ["sceneId", "sceneId2"],
                "player_id" => $playerId,
                "sceneLabel" => $this->upLabel,
                "sceneId" => $this->id,
                "card" => $card,
                "sceneLabel2" => $Scene2->upLabel,
                "sceneId2" => $Scene2->id,
            ]
        );
    }

    public function isAttachable(int $playerId): bool
    {
        return $this->getMaxSlot($playerId) > 0 && $this->canPayCost($playerId);
    }

    public function attach(int $playerId, int $slot): void
    {
        $this->updateStaffPrivate($playerId);
        $position = $this->getNextPosition($playerId, $slot);
        $draft = $this->draftCounter->get($playerId) + 1;

        $sql = "UPDATE {$this->dbTable} SET card_location='placed', card_location_arg={$playerId}, 
        position={$position}, slot={$slot}, draft={$draft} WHERE card_id={$this->cardId}";
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

        $this->updateScenicsPrivate($playerId);
        $this->updateAbilityPrivate($playerId);
        $Scene2->updateCompleted($playerId);
        $Scene2->updateVipFulfilling($playerId);
    }

    public function discard(int $playerId): void
    {
        $card = $this->move("discard", $playerId);

        $draft = $this->draftCounter->get($playerId) + 1;
        $sql = "UPDATE {$this->dbTable} SET draft={$draft} WHERE card_id={$this->cardId}";
        $this->game->DbQuery($sql);

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
        $completedScenes = $this->game->globals->get(gCompletedScenes)[$playerId];
        return in_array($this->cardId, $completedScenes);
    }

    private function checkComplete(int $playerId): bool
    {
        $slot = (int) $this->card["slot"];
        $genreCost = $this->genreCost;

        $genres = $this->sumSlotGenres($playerId, $slot);
        foreach ($genres as $genreId => $value) {
            $genreCost[$genreId] -= $value;

            if ($genreCost[$genreId] < 0) {
                $genreCost[$genreId] = 0;
            }
        }

        $totalCost = array_reduce($genreCost, function ($carry, $cost) {
            return $carry + $cost;
        });

        return $totalCost <= $this->countSlotWilds($playerId, $slot);
    }

    public function updateCompleted(int $playerId): void
    {
        $completedScenes = $this->game->globals->get(gCompletedScenes, []);

        if (in_array($this->cardId, $completedScenes[$playerId])) {
            return;
        }

        if (!$this->checkComplete($playerId)) {
            return;
        }

        $completedScenes[$playerId][] = $this->cardId;
        $this->game->globals->set(gCompletedScenes, $completedScenes);

        $this->game->notify->player(
            $playerId,
            "completeScene",
            "",
            [
                "card" => $this->card,
            ]
        );
    }

    public function updateVipFulfilling(int $playerId): void
    {
        $card = $this->getCard($this->cardId);
        $slot = (int) $card["slot"];

        $Vips = new Vips($this->game);
        $fulfills = $Vips->isFulfilled($playerId, $slot);

        $this->game->notify->player(
            $playerId,
            "updateVipFulfilling",
            "",
            [
                "card" => $card,
                "fulfills" => $fulfills,
            ]
        );
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

        $points = $Vips->isFulfilled($playerId, $slot) ? 2 : 0;
        $this->playerScore->inc($playerId, $points);

        if ($points > 0) {
            $this->game->notify->all(
                "scoreVip",
                clienttranslate('The VIP enters ${sceneLabel}'),
                [
                    "i18n" => ["sceneLabel"],
                    "preserve" => ["sceneId"],
                    "player_id" => $playerId,
                    "sceneLabel" => $this->upLabel,
                    "sceneId" => $this->id,
                    "card" => $this->card,
                    "slot" => $slot,
                ]
            );
        }

        return $points;
    }

    private function updateScenicsPrivate(int $playerId): void
    {
        if ($this->scenic === 0) {
            return;
        }

        $this->game->notify->player(
            $playerId,
            "setPlayerCounterPrivate",
            "",
            [
                "player_id" => $playerId,
                "name" => $this->SCENICS[$this->scenic],
                "inc" => 1,
            ]
        );
    }

    private function updateAbilityPrivate(int $playerId): void
    {
        if ($this->ability === 0) {
            return;
        }

        $this->game->notify->player(
            $playerId,
            "setPlayerCounterPrivate",
            "",
            [
                "player_id" => $playerId,
                "name" => "ability",
                "inc" => 1,
            ]
        );
    }
}

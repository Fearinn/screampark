<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\Actions\CheckAction;
use Bga\GameFramework\Actions\Types\IntArrayParam;
use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\Components\Counters\PlayerCounter;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\ScreamPark\components\scenes\Scene;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\Game;
use BgaVisibleSystemException;

class PlayerTurn extends GameState
{
    protected Scenes $scenes;
    protected PlayerCounter $draftCounter;
    protected PlayerCounter $actionVariable;
    protected PlayerCounter $staffCounterPrivate;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 50,
            type: StateType::PRIVATE,
            description: clienttranslate('Other player(s) must draft 2 scene cards'),
            descriptionMyTurn: clienttranslate('${you} must draft a scene card (${nbr} left)'),
        );

        $this->scenes = new Scenes($this->game);
        $this->draftCounter = $this->game->draftCounter;
        $this->staffCounterPrivate = $this->game->staffCounterPrivate;
        $this->actionVariable = $this->game->actionVariable;
    }

    public function getArgs(int $playerId): array
    {
        $maxSlot = $this->scenes->getMaxSlot($playerId);
        $draftCount = $this->draftCounter->get($playerId);

        $args = [
            "nbr" => 2 - $draftCount,
            "canAttachGenre" => $maxSlot > 0 && $draftCount === 0,
            "placeable" => $this->scenes->getPlaceable($playerId),
            "attachable" => $this->scenes->getAttachable($playerId),
            "placeableAnywhere" => $this->scenes->getPlaceableAnywhere($playerId),
        ];

        return $args;
    }

    public function onEnteringState(int $currentPlayerId): void {}

    #[PossibleAction]
    public function actPlaceScene(
        int $currentPlayerId,
        #[IntParam(min: 1, max: 120)] int $cardId,
    ): void {
        $Scene = new Scene($this->game, $cardId);
        if (!$Scene->isPlaceable($currentPlayerId)) {
            throw new BgaVisibleSystemException("Error code: 2");
        }

        $Scene->place($currentPlayerId);
        $this->draftCounter->inc($currentPlayerId, 1);

        if ($this->draftCounter->get($currentPlayerId) === 2) {
            $this->gamestate->setPlayerNonMultiactive($currentPlayerId, RevealScenes::class);
            return;
        }

        $this->gamestate->nextPrivateState($currentPlayerId, PlayerTurn::class);
    }

    #[PossibleAction]
    public function actDiscardScene(
        int $currentPlayerId,
        #[IntParam(min: 1, max: 120)] int $cardId
    ): void {
        $Scene = new Scene($this->game, $cardId);
        if (!$Scene->isDiscardable($currentPlayerId)) {
            throw new BgaVisibleSystemException("Error code: 3");
        }

        $Scene->discard($currentPlayerId);
        $this->draftCounter->inc($currentPlayerId, 1);

        if ($this->draftCounter->get($currentPlayerId) === 2) {
            $this->gamestate->setPlayerNonMultiactive($currentPlayerId, RevealScenes::class);
            return;
        }

        $this->gamestate->nextPrivateState($currentPlayerId, PlayerTurn::class);
    }

    #[PossibleAction]
    public function actAttachSceneStart(
        int $currentPlayerId,
        #[IntParam(min: 1, max: 120)] int $cardId,
    ) {
        $Scene = new Scene($this->game, $cardId);

        if (!$Scene->isAttachable($currentPlayerId)) {
            throw new BgaVisibleSystemException("Error code: 4");
        }

        $this->actionVariable->set($currentPlayerId, $cardId);

        $maxSlot = $this->scenes->getMaxSlot($currentPlayerId);
        if ($maxSlot === 1) {
            $AttachScene = new AttachScene($this->game);
            $AttachScene->attach($currentPlayerId, $Scene, 1);
            return;
        }

        $this->gamestate->nextPrivateState($currentPlayerId, AttachScene::class);
    }

    #[PossibleAction]
    public function actAttachGenreStart(
        int $currentPlayerId,
        array $args,
        #[IntArrayParam(min: 2, max: 2)] array $cardsIds,
        #[IntParam(min: 1, max: 5)] int $genreId,
    ): void {
        if (!$args["canAttachGenre"]) {
            throw new \BgaVisibleSystemException("Error code: 7");
        }

        $this->scenes->deck->moveCards($cardsIds, "todiscard", $currentPlayerId);
        $this->actionVariable->set($currentPlayerId, $genreId);

        $maxSlot = $this->scenes->getMaxSlot($currentPlayerId);
        if ($maxSlot === 1) {
            $AttachGenre = new AttachGenre($this->game);
            $AttachGenre->attach($currentPlayerId, $genreId, 1);
            return;
        }

        $this->gamestate->nextPrivateState($currentPlayerId, AttachGenre::class);
    }

    #[PossibleAction]
    public function actPlaceAnywhereStart(
        int $currentPlayerId,
        #[IntParam(min: 1, max: 120)] int $cardId,
    ): void {
        $Scene = new Scene($this->game, $cardId);
        if (!$Scene->isPlaceableAnywhere($currentPlayerId)) {
            throw new \BgaVisibleSystemException("Error code: 8");
        };

        $this->actionVariable->set($currentPlayerId, $cardId);

        $selectableSlots = $Scene->getSelectableAnywhereSlots($currentPlayerId);
        if (count($selectableSlots) === 1) {
            $slot = reset($selectableSlots);
            $PlaceAnywhere = new PlaceAnywhere($this->game);
            $PlaceAnywhere->placeAnywhere($currentPlayerId, $Scene, $slot);
            return;
        }

        $this->gamestate->nextPrivateState($currentPlayerId, PlaceAnywhere::class);
    }

    #[PossibleAction]
    #[CheckAction(false)]
    public function actUndoTurn(
        int $currentPlayerId,
    ): void {
        $undo = $this->game->getObjectFromDB("SELECT staff, ability, candelabra, lightbulb, audio, skull 
        FROM player WHERE player_id={$currentPlayerId}");

        $draftedCards = $this->game->getCollectionFromDB("SELECT {$this->scenes->cardFields} FROM {$this->scenes->dbTable} 
        WHERE draft>0 AND card_location_arg={$currentPlayerId} ORDER BY draft");

        $this->game->DbQuery("UPDATE {$this->scenes->dbTable} SET draft=0, card_location='hand', slot=0, position=0
        WHERE draft>0 AND card_location_arg={$currentPlayerId}");

        $shiftedCards = $this->game->getCollectionFromDB("SELECT {$this->scenes->cardFields} FROM {$this->scenes->dbTable} 
        WHERE shifted=1 AND card_location_arg={$currentPlayerId} ORDER BY slot, position DESC");

        $this->game->DbQuery("UPDATE {$this->scenes->dbTable} SET slot=slot-1, shifted=0
        WHERE shifted=1 AND card_location_arg={$currentPlayerId}");

        $shiftedCards = array_map(function ($card) {
            $card["slot"]--;
            return $card;
        }, $shiftedCards);

        $this->game->DbQuery("UPDATE {$this->scenes->dbTable} SET card_location='genreDeck', card_location_arg=0 
        WHERE card_type='genre' AND card_location='hand' AND card_location_arg={$currentPlayerId}");

        $this->draftCounter->set($currentPlayerId, 0);

        $staff = (int) $undo["staff"];
        $this->staffCounterPrivate->set($currentPlayerId, $staff);

        $this->notify->player(
            $currentPlayerId,
            "undoTurn",
            clienttranslate("You undo your turn"),
            [
                "staff" => $staff,
                "ability" => (int) $undo["ability"],
                "candelabra" => (int) $undo["candelabra"],
                "lightbulb" => (int) $undo["lightbulb"],
                "audio" => (int) $undo["audio"],
                "skull" => (int) $undo["skull"],
                "draftedCards" => array_values($draftedCards),
                "shiftedCards" => array_values($shiftedCards),
                "completedScenes" => $this->scenes->getCompleted($currentPlayerId),
                "vipFulfilling" => $this->scenes->getVipFulfilling($currentPlayerId),
            ],
        );

        $this->gamestate->setPlayersMultiactive([$currentPlayerId], PlayerTurn::class);
        $this->gamestate->nextPrivateState($currentPlayerId, PlayerTurn::class);
    }

    public function zombie(int $playerId, array $args): void
    {
        $placeableScenes = $args["placeableScenes"];
        $attachableScenes = $args["attachableScenes"];
        $canAttachGenre = $args["canAttachGenre"];

        $hand = $this->scenes->deck->getPlayerHand($playerId);

        if ($placeableScenes && bga_rand(0, 0)) {
            $cardId = $this->getRandomZombieChoice($placeableScenes);

            $this->actPlaceScene($playerId, $cardId);
            return;
        }

        if ((!$attachableScenes && !$canAttachGenre) || bga_rand(0, 0)) {
            $cardsIds = array_keys($hand);
            $cardId = $this->getRandomZombieChoice($cardsIds);

            $this->actDiscardScene($playerId, $cardId);
            return;
        }

        if ($attachableScenes && (!$canAttachGenre || bga_rand(0, 0))) {
            $cardId = $this->getRandomZombieChoice($attachableScenes);

            $this->actAttachSceneStart($playerId, $cardId);
            return;
        }

        $cardsIds = array_keys($hand);
        shuffle($cardsIds);
        $cardsIds = array_slice($cardsIds, 0, 2);
        $genreId = bga_rand(1, 5);

        $this->actAttachGenreStart($playerId, $args, $cardsIds, $genreId);
    }
}

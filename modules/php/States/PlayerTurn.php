<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

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
    protected PlayerCounter $attachmentVariable;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 50,
            type: StateType::PRIVATE,
            description: clienttranslate('Other player(s) must play or discard 2 scene cards'),
            descriptionMyTurn: clienttranslate('${you} must play or discard 2 scene cards'),
        );

        $this->scenes = new Scenes($this->game);
        $this->draftCounter = $this->game->draftCounter;
        $this->attachmentVariable = $this->game->attachmentVariable;
    }

    public function getArgs(int $playerId): array
    {
        $maxSlot = $this->scenes->getMaxSlot($playerId);

        $args = [
            "canAttachGenre" => $maxSlot > 0 && $this->draftCounter->get($playerId) === 0,
            "playableScenes" => $this->scenes->getPlayable($playerId),
            "attachableScenes" => $this->scenes->getAttachable($playerId),
        ];

        return $args;
    }

    public function onEnteringState(): void {}

    #[PossibleAction]
    public function actPlayScene(
        int $currentPlayerId,
        #[IntParam(min: 1, max: 120)] int $cardId
    ): void {
        $Scene = new Scene($this->game, $cardId);
        if (!$Scene->isPlayable($currentPlayerId)) {
            throw new BgaVisibleSystemException("Unexpected error: 2");
        }

        $Scene->play($currentPlayerId);
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
            throw new BgaVisibleSystemException("Unexpected error: 3");
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
            throw new BgaVisibleSystemException("Unexpected error: 4");
        }

        $this->attachmentVariable->set($currentPlayerId, $cardId);

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
        #[IntArrayParam(min: 2, max: 2)] array $cardIds,
        #[IntParam(min: 1, max: 5)] int $genreId,
    ): void {
        if (!$args["canAttachGenre"]) {
            throw new \BgaVisibleSystemException("Unexpected error: 7");
        }

        $maxSlot = $this->scenes->getMaxSlot($currentPlayerId);
        if ($maxSlot === 1) {
            $AttachGenre = new AttachGenre($this->game);
            $AttachGenre->attach($currentPlayerId, $genreId, 1);
            return;
        }

        $this->scenes->discardBoth($currentPlayerId, $cardIds);
        $this->attachmentVariable->set($currentPlayerId, $genreId);

        $this->gamestate->nextPrivateState($currentPlayerId, AttachGenre::class);
    }

    public function zombie(int $playerId, array $args): void {}
}

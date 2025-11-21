<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

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
    }

    public function getArgs(int $playerId): array
    {
        $args = [
            "playableScenes" => $this->scenes->getPlayable($playerId),
            "attachableScenes" => $this->scenes->getAttachable($playerId),
            "_no_notify" => $this->draftCounter->get($playerId) === 2,
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

        $this->globals->set(gAttaching, $cardId);
        $this->gamestate->nextPrivateState($currentPlayerId, AttachScene::class);
    }

    public function zombie(int $playerId, array $args): void {}
}

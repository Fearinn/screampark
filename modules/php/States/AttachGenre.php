<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\Components\Counters\PlayerCounter;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\ScreamPark\components\scenes\Genre;
use Bga\Games\ScreamPark\components\scenes\Scene;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\Game;
use BgaVisibleSystemException;

class AttachGenre extends GameState
{
    protected Scenes $scenes;
    protected PlayerCounter $draftCounter;
    protected PlayerCounter $attachmentCardId;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 52,
            type: StateType::PRIVATE,
            description: clienttranslate('Other player(s) must play or discard 2 scene cards'),
            descriptionMyTurn: clienttranslate('${you} may attach a ${genre_icon} (${genreLabel}) card to a scene'),
        );

        $this->scenes = new Scenes($this->game);
        $this->draftCounter = $this->game->draftCounter;
        $this->attachmentCardId = $this->game->attachmentCardId;
    }

    public function getArgs(int $playerId): array
    {
        $maxSlot = $this->scenes->getMaxSlot($playerId);
        $cardId = $this->attachmentCardId->get($playerId);
        $Genre = new Genre($this->game, $cardId);

        $args = [
            "genreLabel" => $Genre->label,
            "genreId" =>  $Genre->id,
            "cardId" => $cardId,
            "maxSlot" => $maxSlot,
        ];

        return $args;
    }

    public function onEnteringState(int $currentPlayerId): void {}

    #[PossibleAction]
    public function actAttachScene(
        int $currentPlayerId,
        #[IntParam(min: 1, max: 24)] int $slot,
        array $args,
    ) {
        $cardId = $this->attachmentCardId->get($currentPlayerId);
        $Genre = new Genre($this->game, $cardId);

        if ($args["maxSlot"] < $slot) {
            throw new \BgaVisibleSystemException("Unexpected error: 5");
        }

        $this->attach($currentPlayerId, $Genre, $slot);
    }

    public function attach(int $currentPlayerId, Genre $Genre, int $slot): void
    {
        $Genre->attach($currentPlayerId, $slot);
        $this->draftCounter->inc($currentPlayerId, 1);
        $this->attachmentCardId->set($currentPlayerId, 0);

        if ($this->draftCounter->get($currentPlayerId) === 2) {
            $this->gamestate->setPlayerNonMultiactive($currentPlayerId, RevealScenes::class);
            return;
        }

        $this->gamestate->nextPrivateState($currentPlayerId, PlayerTurn::class);
    }

    #[PossibleAction]
    public function actAttachGenreCancel(int $currentPlayerId): void
    {
        $this->attachmentCardId->set($currentPlayerId, 0);
        $this->gamestate->nextPrivateState($currentPlayerId, PlayerTurn::class);
    }

    public function zombie(int $playerId, array $args): void {}
}

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

class AttachGenre extends GameState
{
    protected Scenes $scenes;
    protected PlayerCounter $draftCounter;
    protected PlayerCounter $actionVariable;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 52,
            type: StateType::PRIVATE,
            description: clienttranslate('Other player(s) must draft 2 scene cards'),
            descriptionMyTurn: clienttranslate('${you} may add a ${genre_icon} (${genreLabel}) card to a scene'),
        );

        $this->scenes = new Scenes($this->game);
        $this->draftCounter = $this->game->draftCounter;
        $this->actionVariable = $this->game->actionVariable;
    }

    public function getArgs(int $playerId): array
    {
        $maxSlot = $this->scenes->getMaxSlot($playerId);
        $genreId = $this->actionVariable->get($playerId);
        $Genre = $this->scenes->getGenre($genreId);
        $cardsToDiscard = $this->scenes->deck->getCardsInLocation("todiscard", $playerId);

        $args = [
            "genreLabel" => $Genre->label,
            "genreId" =>  $Genre->id,
            "cardId" => $Genre->cardId,
            "maxSlot" => $maxSlot,
            "cardsToDiscard" => array_values($cardsToDiscard),
        ];

        return $args;
    }

    public function onEnteringState(int $currentPlayerId): void {}

    #[PossibleAction]
    public function actAttachGenre(
        int $currentPlayerId,
        array $args,
        #[IntParam(min: 1, max: 24)] int $slot,
    ) {
        $genreId = $this->actionVariable->get($currentPlayerId);

        if ($args["maxSlot"] < $slot) {
            throw new \BgaVisibleSystemException("Error code: 5");
        }

        $this->attach($currentPlayerId, $genreId, $slot);
    }

    public function attach(int $currentPlayerId, int $genreId, int $slot): void
    {
        $sql = "UPDATE {$this->scenes->dbTable} SET card_location='discard', draft=2 
        WHERE card_location='todiscard' AND card_location_arg={$currentPlayerId}";
        $this->game->DbQuery($sql);

        $cards = $this->scenes->deck->getCardsInLocation("discard", $currentPlayerId);
        $cardsIds = array_keys($cards);
        [$cardId, $cardId2] = $cardsIds;

        $Scene = new Scene($this->game, $cardId);
        $Scene2 = new Scene($this->game, $cardId2);

        $this->game->notify->player(
            $currentPlayerId,
            "discardBothPrivate",
            clienttranslate('You discard ${sceneLabel} and ${sceneLabel2} to pick a genre card'),
            [
                "i18n" => ["sceneLabel", "sceneLabel2"],
                "preserve" => ["sceneId", "sceneId2"],
                "sceneLabel" => $Scene->upLabel,
                "sceneLabel2" => $Scene2->upLabel,
                "sceneId" => $Scene->id,
                "sceneId2" => $Scene2->id,
                "cards" => array_values($cards),
            ]
        );

        $Genre = $this->scenes->getGenre($genreId);
        $Genre->attach($currentPlayerId, $slot);

        $this->draftCounter->set($currentPlayerId, 2);
        $this->actionVariable->set($currentPlayerId, 0);

        $this->gamestate->setPlayerNonMultiactive($currentPlayerId, RevealScenes::class);
    }

    #[PossibleAction]
    public function actAttachGenreCancel(int $currentPlayerId): void
    {
        $this->scenes->deck->moveAllCardsInLocation("todiscard", "hand", $currentPlayerId, $currentPlayerId);
        $this->actionVariable->set($currentPlayerId, 0);
        $this->gamestate->nextPrivateState($currentPlayerId, PlayerTurn::class);
    }

    public function zombie(int $playerId, array $args): void
    {
        $maxSlot = $args["maxSlot"];
        $slot = bga_rand(1, $maxSlot);
        $this->actAttachGenre($playerId, $args, $slot);
    }
}

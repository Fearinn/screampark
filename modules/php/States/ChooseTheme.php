<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\Actions\CheckAction;
use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\ScreamPark\Game;
use Bga\Games\ScreamPark\components\themes\Themes;

class ChooseTheme extends GameState
{
    protected Themes $themes;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 2,
            type: StateType::MULTIPLE_ACTIVE_PLAYER,
            description: clienttranslate('Other player(s) must choose a Theme'),
            descriptionMyTurn: clienttranslate('${you} must choose a Theme to keep'),
        );

        $this->themes = new Themes($this->game);
    }

    public function getArgs(): array
    {
        $args = [];

        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $playerId => $player) {
            $hand = $this->themes->deck->getPlayerHand($playerId);

            $args[$playerId] = [
                "hand" => array_keys($hand),
            ];
        }

        return $args;
    }

    public function onEnteringState(): void
    {
        $this->gamestate->setAllPlayersMultiactive();
    }

    #[PossibleAction]
    public function actChooseTheme(
        int $currentPlayerId,
        #[IntParam(min: 1, max: 10)] int $cardId,
        array $args
    ): void {
        $hand = $args[$currentPlayerId]["hand"];

        if (!in_array($cardId, $hand)) {
            throw new \BgaVisibleSystemException("Unexpected error: 1");
        }

        $handLeft = array_filter($hand, function (int $card_id) use ($cardId) {
            return (int) $card_id !== $cardId;
        }, ARRAY_FILTER_USE_BOTH);
        $otherCardId = reset($handLeft);

        $this->themes->deck->moveCard($otherCardId, "box", $currentPlayerId);

        $this->notify->all(
            "discardTheme",
            "",
            [
                "cardId" => $otherCardId
            ]
        );

        $this->gamestate->setPlayerNonMultiactive($currentPlayerId, RevealThemes::class);
    }

    #[PossibleAction]
    #[CheckAction(false)]
    public function actUndoChooseTheme(int $currentPlayerId)
    {
        if ($this->game->isSpectator()) {
            throw new \BgaVisibleSystemException("Unexpected Error: 99");
        }

        $sql = "SELECT card_id FROM {$this->themes->dbTable} WHERE card_location='box' AND card_location_arg={$currentPlayerId}";
        $cardId = (int) $this->game->getUniqueValueFromDB($sql);

        $this->themes->deck->moveCard($cardId, "hand", $currentPlayerId);
        $card = $this->themes->deck->getCard($cardId);

        $this->notify->player(
            $currentPlayerId,
            "privateGetTheme",
            "",
            [
                "card" => $card,
            ]
        );

        $this->notify->all(
            "getTheme",
            "",
            [
                "cardId" => $cardId,
            ]
        );

        $this->gamestate->setPlayersMultiactive([$currentPlayerId], RevealThemes::class);
    }

    public function zombie(int $playerId, array $args): void
    {
        $hand = $args["_private"][$playerId]["hand"];
        $cardId = $hand[bga_rand(0, 1)];

        $this->actChooseTheme($playerId, $cardId, $args);
    }
}

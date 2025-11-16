<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\Actions\Types\IntParam;
use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\GameFramework\States\PossibleAction;
use Bga\Games\ScreamPark\Game;
use Bga\Games\ScreamPark\Notifs;
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
        $args = [
            "_private" => []
        ];

        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $playerId => $player) {
            $hand = $this->themes->deck->getPlayerHand($playerId);

            $args["_private"][$playerId] = [
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
        $hand = $args["_private"][$currentPlayerId]["hand"];

        if (!in_array($cardId, $hand)) {
            throw new \BgaVisibleSystemException("Unexpected error: 1");
        }

        $handLeft = array_filter($hand, function (int $card_id) use ($cardId) {
            return (int) $card_id !== $cardId;
        }, ARRAY_FILTER_USE_BOTH);
        $otherCardId = reset($handLeft);

        $this->game->notify->all("discardTheme", "", [
            "card_id" => $otherCardId
        ]);

        $this->themes->deck->moveCard($otherCardId, "box", $currentPlayerId);
        $this->gamestate->setPlayerNonMultiactive($currentPlayerId, NextPlayer::class);
    }

    function zombie(int $playerId, array $args): void
    {
        $hand = $args["_private"][$playerId]["hand"];
        $cardId = $hand[bga_rand(0, 1)];

        $this->actChooseTheme($playerId, $cardId, $args);
    }
}

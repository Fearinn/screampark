<?php

declare(strict_types=1);

namespace Bga\Games\ScreamPark\States;

use Bga\GameFramework\States\GameState;
use Bga\GameFramework\StateType;
use Bga\Games\ScreamPark\components\scenes\Genre;
use Bga\Games\ScreamPark\components\scenes\Scene;
use Bga\Games\ScreamPark\components\scenes\Scenes;
use Bga\Games\ScreamPark\components\vips\Vips;
use Bga\Games\ScreamPark\Game;

class RevealScenes extends GameState
{
    protected Scenes $scenes;
    protected array $SCENES;
    protected array $SCENICS;
    protected Vips $vips;

    function __construct(
        protected Game $game,
    ) {
        parent::__construct(
            $game,
            id: 6,
            type: StateType::GAME,
            description: clienttranslate('Revealing scene cards...'),
        );

        $this->scenes = new Scenes($this->game);
        $this->SCENES = $this->game->SCENES;
        $this->SCENICS = $this->game->SCENICS;
        $this->vips = new Vips($this->game);
    }

    public function onEnteringState(): string
    {
        $players = $this->game->loadPlayersBasicInfos();
        foreach ($players as $playerId => $player) {
            $this->scenes->revealDiscardedBoth($playerId);

            $sql = "SELECT {$this->scenes->cardFields} FROM {$this->scenes->dbTable} 
            WHERE (draft=1 OR draft=2) AND card_location_arg={$playerId} ORDER BY draft";
            $cards = $this->game->getCollectionFromDB($sql);

            foreach ($cards as $cardId => $card) {
                if ($card["type"] === "genre") {
                    $Genre = new Genre($this->game, $cardId);
                    $Genre->revealAttached($playerId);
                    continue;
                }

                $location = $card["location"];
                $Scene = new Scene($this->game, $cardId);

                if ($location === "discard") {
                    $Scene->revealDiscarded($playerId);
                }

                if ($location === "placed") {
                    $Scene->revealPlaced($playerId);
                }

                if ($location === "placedAnywhere") {
                    $Scene->revealPlacedAnywhere($playerId);
                }
            }

            $abilityCounts = $this->scenes->getAbilityCounts();
            foreach ($abilityCounts as $playerId => $count) {
                $this->notify->all("setPlayerCounter", "", [
                    "playerId" => $playerId,
                    "name" => "ability",
                    "value" => $count,
                    "manual" => true,
                ]);
            }

            $scenicsCounts = $this->scenes->getScenicsCounts();
            foreach ($scenicsCounts as $playerId => $counts) {
                foreach ($counts as $scenicId => $count) {
                    $this->notify->all("setPlayerCounter", "", [
                        "playerId" => $playerId,
                        "name" => $this->SCENICS[$scenicId],
                        "value" => $count,
                        "manual" => true,
                    ]);
                }
            }
        }

        $this->game->DbQuery("UPDATE {$this->scenes->dbTable} SET draft=0 WHERE draft>0");
        return PassScenes::class;
    }
}

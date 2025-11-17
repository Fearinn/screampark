<?php

/**
 *------
 * BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
 * ScreamPark implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * Game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 */

declare(strict_types=1);

namespace Bga\Games\ScreamPark;

use Bga\GameFramework\Components\Deck;
use Bga\Games\ScreamPark\Gamedatas;
use Bga\Games\ScreamPark\SetupNewGame;

class Game extends \Bga\GameFramework\Table
{
    use Gamedatas;
    use SetupNewGame;
    use Notifs;

    public readonly array $VIPS;
    public readonly Deck $vip_cards;
    public readonly array $GENRES;
    public readonly array $SCENES;
    public readonly Deck $scene_cards;
    public readonly array $THEMES;
    public readonly Deck $theme_cards;

    public function __construct()
    {
        require "_material/material.inc.php";

        parent::__construct();
        $this->initGameStateLabels([]);

        $this->vip_cards = $this->deckFactory->createDeck("vips");
        $this->scene_cards = $this->deckFactory->createDeck("scenes");
        $this->theme_cards = $this->deckFactory->createDeck("themes");

        $this->decorateNotifs();
    }

    public function getGameProgression()
    {
        return 0;
    }

    public function upgradeTableDb($from_version) {}

    protected function getAllDatas(): array
    {
        return $this->getGamedatas($this);
    }

    protected function setupNewGame($players, $options = [])
    {
        return $this->newGame($players, $options);
    }

    public function debug_goToState(int $state = 3)
    {
        $this->gamestate->jumpToState($state);
    }

    public function debug_playAutomatically(int $moves = 50)
    {
        $count = 0;
        while (intval($this->gamestate->getCurrentMainStateId()) < 99 && $count < $moves) {
            $count++;
            foreach ($this->gamestate->getActivePlayerList() as $playerId) {
                $playerId = (int) $playerId;
                $this->gamestate->runStateClassZombie($this->gamestate->getCurrentState($playerId), $playerId);
            }
        }
    }
}

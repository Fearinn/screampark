<?php

namespace Bga\Games\ScreamPark;

trait Notifs
{
    private function decoratePlayerName(string $message, array &$args): void
    {
        if (
            isset($args["player_id"]) &&
            !isset($args["player_name"]) &&
            str_contains($message, '${player_name}')
        ) {
            $args["player_name"] = $this->getPlayerNameById($args["player_id"]);
        }

        for ($i = 2; $i <= 6; $i++) {
            if (
                isset($args["player_id{$i}"]) &&
                !isset($args["player_name{$i}"]) &&
                str_contains($message, "{player_name{$i}")
            ) {
                $args["player_name{$i}"] = $this->getPlayerNameById($args["player_id{$i}"]);
            }
        }
    }

    private function decoratePlayerId(string $message, array &$args)
    {
        if (!isset($args["player_id"])) {
            $args["player_id"] = (int) $this->getCurrentPlayerId();
        }
    }

    public function decorateNotifs(): void
    {
        $this->notify->addDecorator(
            function (
                string $message,
                array $args
            ): array {
                $this->decoratePlayerId($message, $args);
                $this->decoratePlayerName($message, $args);
                return $args;
            }
        );
    }
}

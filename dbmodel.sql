-- ------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- ScreamPark implementation : © <Your name here> <Your email address here>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----
-- dbmodel.sql
CREATE TABLE IF NOT EXISTS `vips` (
    `card_id` int(2) unsigned NOT NULL AUTO_INCREMENT,
    `card_type` varchar(24) NOT NULL,
    `card_type_arg` int(2) NOT NULL,
    `card_location` varchar(16) NOT NULL,
    `card_location_arg` int(11) NOT NULL,
    PRIMARY KEY (`card_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 AUTO_INCREMENT = 1;
CREATE TABLE IF NOT EXISTS `scenes` (
    `card_id` int(3) unsigned NOT NULL AUTO_INCREMENT,
    `card_type` varchar(6) NOT NULL,
    `card_type_arg` int(3) NOT NULL,
    `card_location` varchar(16) NOT NULL,
    `card_location_arg` int(11) NOT NULL,
    `slot` int(2) DEFAULT 0,
    `position` int(2) DEFAULT 0,
    PRIMARY KEY (`card_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 AUTO_INCREMENT = 1;
CREATE TABLE IF NOT EXISTS `themes` (
    `card_id` int(2) unsigned NOT NULL AUTO_INCREMENT,
    `card_type` varchar(5) NOT NULL,
    `card_type_arg` int(2) NOT NULL,
    `card_location` varchar(16) NOT NULL,
    `card_location_arg` int(11) NOT NULL,
    PRIMARY KEY (`card_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 AUTO_INCREMENT = 1;
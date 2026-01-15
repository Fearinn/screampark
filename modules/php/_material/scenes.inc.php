<?php

$this->SCENES = [
    1 => [
        "id" => 1,
        "UP" => [
            "label" => clienttranslate("Prison Cell"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Fake Razor Wire"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 4,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    2 => [
        "id" => 2,
        "UP" => [
            "label" => clienttranslate("Police Precint"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Hidden Trapdoor"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 1,
            "staffCost" => 0,
        ]
    ],
    3 => [
        "id" => 3,
        "UP" => [
            "label" => clienttranslate("Sewer System"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Dripping Water"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 3,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    4 => [
        "id" => 4,
        "UP" => [
            "label" => clienttranslate("Dirty Bathroom"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Trapped Victim"),
            "genres" => [
                1 => 2,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    5 => [
        "id" => 5,
        "UP" => [
            "label" => clienttranslate("Quiet Toy Store"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Bloody Handprints"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 1,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    6 => [
        "id" => 6,
        "UP" => [
            "label" => clienttranslate("Dazzling Arcade"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Murdurous Mascot"),
            "genres" => [
                1 => 1,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    7 => [
        "id" => 7,
        "UP" => [
            "label" => clienttranslate("Dummy Warehouse"),
            "points" => 4,
            "genreCost" => [
                1 => 2,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Manequim"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 2,
            "staffCost" => 0,
        ]
    ],
    8 => [
        "id" => 8,
        "UP" => [
            "label" => clienttranslate("Meat Freezer"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 3,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Dangling Bodies"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 4,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    9 => [
        "id" => 9,
        "UP" => [
            "label" => clienttranslate("Torture Cases"),
            "points" => 4,
            "genreCost" => [
                1 => 1,
                2 => 2,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Static Sparkers"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 3,
            "staffCost" => 0,
        ]
    ],
    10 => [
        "id" => 10,
        "UP" => [
            "label" => clienttranslate("Rusty Garrows"),
            "points" => 4,
            "genreCost" => [
                1 => 2,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Falling Guillotine"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 4,
            "staffCost" => 0,
        ]
    ],
    11 => [
        "id" => 11,
        "UP" => [
            "label" => clienttranslate("Torment Workshop"),
            "points" => 6,
            "genreCost" => [
                1 => 1,
                2 => 1,
                3 => 0,
                4 => 1,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Angry Torture"),
            "genres" => [
                1 => 0,
                2 => 2,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    12 => [
        "id" => 12,
        "UP" => [
            "label" => clienttranslate("Red Room"),
            "points" => 6,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 1,
                4 => 2,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Puppet"),
            "genres" => [
                1 => 1,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    13 => [
        "id" => 13,
        "UP" => [
            "label" => clienttranslate("Empty Stables"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Wraith"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    14 => [
        "id" => 14,
        "UP" => [
            "label" => clienttranslate("Decaying Atrium"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Big Chandelier"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 4,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    15 => [
        "id" => 15,
        "UP" => [
            "label" => clienttranslate("Rotting Kitchen"),
            "points" => 2,
            "genreCost" => [
                1 => 2,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Zipline Bats"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 2,
            "staffCost" => 0,
        ]
    ],
    16 => [
        "id" => 16,
        "UP" => [
            "label" => clienttranslate("Haunted Gallery"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Changing Paintings"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 2,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    17 => [
        "id" => 17,
        "UP" => [
            "label" => clienttranslate("Noble Ballroom"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Tooth Gargoyles"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 4,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    18 => [
        "id" => 18,
        "UP" => [
            "label" => clienttranslate("Deathly Bathroom"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Pepper's Ghost"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 3,
            "staffCost" => 0,
        ]
    ],
    19 => [
        "id" => 19,
        "UP" => [
            "label" => clienttranslate("Webbed Attic"),
            "points" => 4,
            "genreCost" => [
                1 => 3,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Pneumatic Spider"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 4,
            "staffCost" => 0,
        ]
    ],
    20 => [
        "id" => 20,
        "UP" => [
            "label" => clienttranslate("Dusty Library"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Etheral Singing"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 3,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    21 => [
        "id" => 21,
        "UP" => [
            "label" => clienttranslate("Poison Greenhouse"),
            "points" => 4,
            "genreCost" => [
                1 => 2,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Plague Doctor"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    22 => [
        "id" => 22,
        "UP" => [
            "label" => clienttranslate("Hedge Maze"),
            "points" => 4,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 1,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Pumpkin Lord"),
            "genres" => [
                1 => 2,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    23 => [
        "id" => 23,
        "UP" => [
            "label" => clienttranslate("Flooded Chamber"),
            "points" => 6,
            "genreCost" => [
                1 => 2,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Laser Mist"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 1,
            "staffCost" => 0,
        ]
    ],
    24 => [
        "id" => 24,
        "UP" => [
            "label" => clienttranslate("Dark Room"),
            "points" => 6,
            "genreCost" => [
                1 => 0,
                2 => 3,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Gentleman Ghost"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    25 => [
        "id" => 25,
        "UP" => [
            "label" => clienttranslate("Agency Offices"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Wanted Posters"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 1,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    26 => [
        "id" => 26,
        "UP" => [
            "label" => clienttranslate("Interrogation Room"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Rage Cage"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 3,
            "staffCost" => 0,
        ]
    ],
    27 => [
        "id" => 27,
        "UP" => [
            "label" => clienttranslate("Research Facility"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Secure Entrance"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 0,
            "ability" => 1,
            "staffCost" => 0,
        ]
    ],
    28 => [
        "id" => 28,
        "UP" => [
            "label" => clienttranslate("Autopsy Station"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Dissected Pacient"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    29 => [
        "id" => 29,
        "UP" => [
            "label" => clienttranslate("Testing Chamber"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 2,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Irradiated Mutant"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 2,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    30 => [
        "id" => 30,
        "UP" => [
            "label" => clienttranslate("Biohazard Vault"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Radioactive Sludge"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 4,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    31 => [
        "id" => 31,
        "UP" => [
            "label" => clienttranslate("Quarantine Zone"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Sample Tanks"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 4,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    32 => [
        "id" => 32,
        "UP" => [
            "label" => clienttranslate("Evacuated Office"),
            "points" => 4,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Blacklight Paint"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 2,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    33 => [
        "id" => 33,
        "UP" => [
            "label" => clienttranslate("Military Sala"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 2,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Pulsing Blob"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 4,
            "staffCost" => 0,
        ]
    ],
    34 => [
        "id" => 34,
        "UP" => [
            "label" => clienttranslate("Weapon Storage"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 1,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Agent"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    35 => [
        "id" => 35,
        "UP" => [
            "label" => clienttranslate("Command Center"),
            "points" => 6,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 3,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Reptilian Hybrid"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 2,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    36 => [
        "id" => 36,
        "UP" => [
            "label" => clienttranslate("Observation Deck"),
            "points" => 6,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 3,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Kaiju Animatronic"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 0,
            "ability" => 2,
            "staffCost" => 0,
        ]
    ],
    37 => [
        "id" => 37,
        "UP" => [
            "label" => clienttranslate("Dark Highway"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Truck Horn"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 0,
            "ability" => 2,
            "staffCost" => 0,
        ]
    ],
    38 => [
        "id" => 38,
        "UP" => [
            "label" => clienttranslate("Gas Station"),
            "points" => 2,
            "genreCost" => [
                1 => 2,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Disguised Android"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    39 => [
        "id" => 39,
        "UP" => [
            "label" => clienttranslate("Dead-End Dinner"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Looping Jukebox"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 3,
            "staffCost" => 0,
        ]
    ],
    40 => [
        "id" => 40,
        "UP" => [
            "label" => clienttranslate("Corn Field"),
            "points" => 2,
            "genreCost" => [
                1 => 2,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Sneaky Scarecrow"),
            "genres" => [
                1 => 2,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    41 => [
        "id" => 41,
        "UP" => [
            "label" => clienttranslate("Human Living Room"),
            "points" => 2,
            "genreCost" => [
                1 => 2,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Security Screens"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 4,
            "staffCost" => 0,
        ]
    ],
    42 => [
        "id" => 42,
        "UP" => [
            "label" => clienttranslate("Crashed Pod"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 2,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Strange Debris"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 4,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    43 => [
        "id" => 43,
        "UP" => [
            "label" => clienttranslate("Humming Monolith"),
            "points" => 4,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Disturbing Tones"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 3,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    44 => [
        "id" => 44,
        "UP" => [
            "label" => clienttranslate("Invaded Barn"),
            "points" => 4,
            "genreCost" => [
                1 => 2,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Abduction Beam"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 0,
            "ability" => 1,
            "staffCost" => 0,
        ]
    ],
    45 => [
        "id" => 45,
        "UP" => [
            "label" => clienttranslate("Medical Wing"),
            "points" => 4,
            "genreCost" => [
                1 => 2,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Hazy Lights"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 2,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    46 => [
        "id" => 46,
        "UP" => [
            "label" => clienttranslate("Organ Storeroom"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 2,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Glowing Jars"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 2,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    47 => [
        "id" => 47,
        "UP" => [
            "label" => clienttranslate("Alien Zoo"),
            "points" => 6,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 1,
                4 => 1,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Hungry Plant"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 2,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    48 => [
        "id" => 48,
        "UP" => [
            "label" => clienttranslate("Flight Deck"),
            "points" => 6,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 4,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Martian Leader"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    49 => [
        "id" => 49,
        "UP" => [
            "label" => clienttranslate("Ticket Booth"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Story Video"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 2,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    50 => [
        "id" => 50,
        "UP" => [
            "label" => clienttranslate("Gift Shop"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Merchandise"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 1,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    51 => [
        "id" => 51,
        "UP" => [
            "label" => clienttranslate("Caravan Camp"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Flying Knife"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 2,
            "staffCost" => 0,
        ]
    ],
    52 => [
        "id" => 52,
        "UP" => [
            "label" => clienttranslate("Curio Cabinet"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 2,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Doll Collection"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 4,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    53 => [
        "id" => 53,
        "UP" => [
            "label" => clienttranslate("Psychic Parlor"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 2,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Fortune Teller"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    54 => [
        "id" => 54,
        "UP" => [
            "label" => clienttranslate("Beast Pens"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Growling Crates"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 4,
            "staffCost" => 0,
        ]
    ],
    55 => [
        "id" => 55,
        "UP" => [
            "label" => clienttranslate("Grand Arena"),
            "points" => 4,
            "genreCost" => [
                1 => 1,
                2 => 1,
                3 => 0,
                4 => 2,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Depraved Magician"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    56 => [
        "id" => 56,
        "UP" => [
            "label" => clienttranslate("Carnival Ride"),
            "points" => 4,
            "genreCost" => [
                1 => 2,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Dynamic Spotlight"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 3,
            "staffCost" => 0,
        ]
    ],
    57 => [
        "id" => 57,
        "UP" => [
            "label" => clienttranslate("Closed Funhouse"),
            "points" => 4,
            "genreCost" => [
                1 => 3,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Body-Sawing Box"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 1,
            "staffCost" => 0,
        ]
    ],
    58 => [
        "id" => 58,
        "UP" => [
            "label" => clienttranslate("Hall of Mirrors"),
            "points" => 4,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 3,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Uncanny Mimic"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 2,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    59 => [
        "id" => 59,
        "UP" => [
            "label" => clienttranslate("Spinning Tunnel"),
            "points" => 6,
            "genreCost" => [
                1 => 2,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Constant Laughter"),
            "genres" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 3,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    60 => [
        "id" => 60,
        "UP" => [
            "label" => clienttranslate("Balloon Room"),
            "points" => 6,
            "genreCost" => [
                1 => 1,
                2 => 1,
                3 => 1,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Birthday Clown"),
            "genres" => [
                1 => 2,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    61 => [
        "id" => 61,
        "UP" => [
            "label" => clienttranslate("Secret Clubhouse"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 2,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Conspiracy Wall"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 1,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    62 => [
        "id" => 62,
        "UP" => [
            "label" => clienttranslate("Vandalized Bunk"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Kid Whispers"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 3,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    63 => [
        "id" => 63,
        "UP" => [
            "label" => clienttranslate("Broken Train"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 2,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Smoke Smell"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 2,
            "staffCost" => 0,
        ]
    ],
    64 => [
        "id" => 64,
        "UP" => [
            "label" => clienttranslate("Forgotten Forest"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Bog Fog"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 1,
            "staffCost" => 0,
        ]
    ],
    65 => [
        "id" => 65,
        "UP" => [
            "label" => clienttranslate("Hiker's Campsite"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Bright Campfire"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 3,
            "staffCost" => 0,
        ]
    ],
    66 => [
        "id" => 66,
        "UP" => [
            "label" => clienttranslate("Ranger Station"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 2,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Hiding Cryptid"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 2,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    67 => [
        "id" => 67,
        "UP" => [
            "label" => clienttranslate("Misty Dock"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 2,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Gutted Fish"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 4,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    68 => [
        "id" => 68,
        "UP" => [
            "label" => clienttranslate("Local Boathouse"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 3,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Lake Monster"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    69 => [
        "id" => 69,
        "UP" => [
            "label" => clienttranslate("Cave Entrance"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Warning Signs"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 1,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    70 => [
        "id" => 70,
        "UP" => [
            "label" => clienttranslate("Damp Mineshaft"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 1,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Fake Rock Collapse"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 4,
            "staffCost" => 0,
        ]
    ],
    71 => [
        "id" => 71,
        "UP" => [
            "label" => clienttranslate("Locked Basement"),
            "points" => 6,
            "genreCost" => [
                1 => 1,
                2 => 1,
                3 => 1,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Possesed Girl"),
            "genres" => [
                1 => 0,
                2 => 2,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    72 => [
        "id" => 72,
        "UP" => [
            "label" => clienttranslate("Log Cabin"),
            "points" => 6,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 1,
                4 => 2,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Masked Killer"),
            "genres" => [
                1 => 0,
                2 => 2,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    73 => [
        "id" => 73,
        "UP" => [
            "label" => clienttranslate("Doomsday Shelter"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Freight Elevator"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 1,
            "staffCost" => 0,
        ]
    ],
    74 => [
        "id" => 74,
        "UP" => [
            "label" => clienttranslate("Subway Station"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Abomination"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    75 => [
        "id" => 75,
        "UP" => [
            "label" => clienttranslate("Raided Store"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Dirty Mercenary"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    76 => [
        "id" => 76,
        "UP" => [
            "label" => clienttranslate("Drive-In Theater"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Infected Zombie"),
            "genres" => [
                1 => 0,
                2 => 2,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    77 => [
        "id" => 77,
        "UP" => [
            "label" => clienttranslate("Garbage Dump"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Crushed Car"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 1,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    78 => [
        "id" => 78,
        "UP" => [
            "label" => clienttranslate("Factory Floor"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 2,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Bubbling Goo"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 4,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    79 => [
        "id" => 79,
        "UP" => [
            "label" => clienttranslate("Makeshift Forge"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 2,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Flame Burst"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 3,
            "staffCost" => 0,
        ]
    ],
    80 => [
        "id" => 80,
        "UP" => [
            "label" => clienttranslate("Scavenger Base"),
            "points" => 4,
            "genreCost" => [
                1 => 1,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Junk Barricade"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 1,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    81 => [
        "id" => 81,
        "UP" => [
            "label" => clienttranslate("Radio Room"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 1,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Defective Robot"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 2,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    82 => [
        "id" => 82,
        "UP" => [
            "label" => clienttranslate("Canibal Cave"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 3,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Bone Pits"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 1,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    83 => [
        "id" => 83,
        "UP" => [
            "label" => clienttranslate("Maradeur Fort"),
            "points" => 6,
            "genreCost" => [
                1 => 0,
                2 => 2,
                3 => 0,
                4 => 0,
                5 => 2,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Rolling Oil Drums"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 0,
            "ability" => 4,
            "staffCost" => 0,
        ]
    ],
    84 => [
        "id" => 84,
        "UP" => [
            "label" => clienttranslate("Rockslash Arena"),
            "points" => 6,
            "genreCost" => [
                1 => 0,
                2 => 2,
                3 => 0,
                4 => 0,
                5 => 2,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Rigged Chainsaw"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 2,
            "staffCost" => 0,
        ]
    ],
    85 => [
        "id" => 85,
        "UP" => [
            "label" => clienttranslate("Ancient Graveyard"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Eerie Winds"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 3,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    86 => [
        "id" => 86,
        "UP" => [
            "label" => clienttranslate("Antique Room"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Skiterring Critters"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 3,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    87 => [
        "id" => 87,
        "UP" => [
            "label" => clienttranslate("Trophy Room"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Captive Werewolf"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    88 => [
        "id" => 88,
        "UP" => [
            "label" => clienttranslate("Eerie Dining Hall"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 2,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Floating Candles"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 4,
            "staffCost" => 0,
        ]
    ],
    89 => [
        "id" => 89,
        "UP" => [
            "label" => clienttranslate("Feeding Room"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Noble Vampire"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    90 => [
        "id" => 90,
        "UP" => [
            "label" => clienttranslate("Moonlit Dungeon"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Popping Coffins"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 1,
            "staffCost" => 0,
        ]
    ],
    91 => [
        "id" => 91,
        "UP" => [
            "label" => clienttranslate("Deep Catacombs"),
            "points" => 4,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 1,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Grabbing Hands"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 3,
            "staffCost" => 0,
        ]
    ],
    92 => [
        "id" => 92,
        "UP" => [
            "label" => clienttranslate("Stolen Tomb"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 2,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Living Mummy"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 2,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    93 => [
        "id" => 93,
        "UP" => [
            "label" => clienttranslate("Alchemy Room"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Shifting Symbols"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 2,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    94 => [
        "id" => 94,
        "UP" => [
            "label" => clienttranslate("Vintage Lab"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 2,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Mad Scientist"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    95 => [
        "id" => 95,
        "UP" => [
            "label" => clienttranslate("Narrow Passage"),
            "points" => 6,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 3,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Endless Wailing"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 3,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    96 => [
        "id" => 96,
        "UP" => [
            "label" => clienttranslate("Burned Tower"),
            "points" => 6,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 2,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Moving Dragon Head"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 2,
            "staffCost" => 0,
        ]
    ],
    97 => [
        "id" => 97,
        "UP" => [
            "label" => clienttranslate("Museum Exhibit"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Legend Narration"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 3,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    98 => [
        "id" => 98,
        "UP" => [
            "label" => clienttranslate("Waiting Room"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Awful Lighting"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 2,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    99 => [
        "id" => 99,
        "UP" => [
            "label" => clienttranslate("Padded Room"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Confused Drawings"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 1,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    100 => [
        "id" => 100,
        "UP" => [
            "label" => clienttranslate("Crawlspace"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Ankle Ticklers"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 0,
            "ability" => 4,
            "staffCost" => 0,
        ]
    ],
    101 => [
        "id" => 101,
        "UP" => [
            "label" => clienttranslate("Psychochamber"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 2,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Giant Projector"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 3,
            "staffCost" => 0,
        ]
    ],
    102 => [
        "id" => 102,
        "UP" => [
            "label" => clienttranslate("Maw of Madness"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Raving Madman"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 2,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    103 => [
        "id" => 103,
        "UP" => [
            "label" => clienttranslate("Decrepit Hut"),
            "points" => 4,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 1,
                4 => 1,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Hag Witch"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 1,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    104 => [
        "id" => 104,
        "UP" => [
            "label" => clienttranslate("Crumbling Ruins"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 2,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Chating Cultist"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 1,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    105 => [
        "id" => 105,
        "UP" => [
            "label" => clienttranslate("Lighthouse Room"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 2,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Strobelight"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 1,
            ],
            "scenic" => 0,
            "ability" => 2,
            "staffCost" => 0,
        ]
    ],
    106 => [
        "id" => 106,
        "UP" => [
            "label" => clienttranslate("Room of Eyes"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 2,
                5 => 1,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Tentacled Being"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 2,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    107 => [
        "id" => 107,
        "UP" => [
            "label" => clienttranslate("Portal Room"),
            "points" => 6,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 3,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Infinity Mirrors"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 1,
            "staffCost" => 0,
        ]
    ],
    108 => [
        "id" => 108,
        "UP" => [
            "label" => clienttranslate("Abyss Bridge"),
            "points" => 6,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 3,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Dramatic Music"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
            "scenic" => 3,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    109 => [
        "id" => 109,
        "UP" => [
            "label" => clienttranslate("Child's Room"),
            "points" => 2,
            "genreCost" => [
                1 => 1,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Rumbling Bed"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 2,
            "staffCost" => 0,
        ]
    ],
    110 => [
        "id" => 110,
        "UP" => [
            "label" => clienttranslate("Messy Study"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Dancing Shadows"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 2,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    111 => [
        "id" => 111,
        "UP" => [
            "label" => clienttranslate("Overgrown Garden"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Blood Fountain"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 4,
            "staffCost" => 0,
        ]
    ],
    112 => [
        "id" => 112,
        "UP" => [
            "label" => clienttranslate("Arched Walkway"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Diabolic Nun"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    113 => [
        "id" => 113,
        "UP" => [
            "label" => clienttranslate("Confessional"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Blurry Faces"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 2,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    114 => [
        "id" => 114,
        "UP" => [
            "label" => clienttranslate("Dim Mausoleum"),
            "points" => 2,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 2,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Sinful Spirit"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 2,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    115 => [
        "id" => 115,
        "UP" => [
            "label" => clienttranslate("Forsake Chapel"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 2,
                3 => 1,
                4 => 1,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Ghoul Priest"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
    116 => [
        "id" => 116,
        "UP" => [
            "label" => clienttranslate("Winding Labyrinth"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 0,
                3 => 3,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Ghostlights"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 2,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    117 => [
        "id" => 117,
        "UP" => [
            "label" => clienttranslate("Ritual Chamber"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 2,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Unholy Altar"),
            "genres" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 1,
            "ability" => 0,
            "staffCost" => 0,
        ]
    ],
    118 => [
        "id" => 118,
        "UP" => [
            "label" => clienttranslate("Exorcism Room"),
            "points" => 4,
            "genreCost" => [
                1 => 0,
                2 => 2,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Ceiling Harness"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 3,
            "staffCost" => 0,
        ]
    ],
    119 => [
        "id" => 119,
        "UP" => [
            "label" => clienttranslate("Swirling Hallways"),
            "points" => 6,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 0,
                4 => 0,
                5 => 2,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Moving Walls"),
            "genres" => [
                1 => 0,
                2 => 0,
                3 => 1,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 1,
            "staffCost" => 0,
        ]
    ],
    120 => [
        "id" => 120,
        "UP" => [
            "label" => clienttranslate("Evil Realm"),
            "points" => 6,
            "genreCost" => [
                1 => 0,
                2 => 1,
                3 => 3,
                4 => 0,
                5 => 0,
            ],
        ],
        "DOWN" => [
            "label" => clienttranslate("Demon Queen"),
            "genres" => [
                1 => 0,
                2 => 2,
                3 => 0,
                4 => 0,
                5 => 0,
            ],
            "scenic" => 0,
            "ability" => 0,
            "staffCost" => 1,
        ]
    ],
];

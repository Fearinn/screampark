class PlayerTurn extends State {
  private sceneManager: SceneManager;
  private SCENES: Record<number, SCENE>;
  private GENRES: Record<number, GENRE>;

  constructor(game: SCP) {
    super(game);
    this.sceneManager = new SceneManager(this.game);
    this.SCENES = this.game.gamedatas.SCENES;
    this.GENRES = this.game.gamedatas.GENRES;
  }

  public onUpdate(args: ArgsPlayerTurn): void {
    super.onUpdate(args);

    if (!this.game.isCurrentPlayerActive()) {
      this.onInactiveUpdate();
      return;
    }

    const { keysToNumbers } = this.game;
    const { placeableScenes, attachableScenes, canAttachGenre, nbr } = args;

    const { hand } = this.sceneManager.stocks;
    hand.setSelectionMode(canAttachGenre ? "multiple" : "single");

    hand.onSelectionChange = (selection, lastChange) => {
      this.game.clearButtons();
      this.game.statusBar.setTitle(
        _("${you} must play or discard a scene card (${nbr} left)"),
        {
          nbr,
        }
      );

      if (selection.length === 0) {
        return;
      }

      if (selection.length === 2) {
        this.game.statusBar.setTitle(
          _("${you} may discard both scenes to pick any genre card")
        );

        keysToNumbers(this.GENRES).forEach((genreId) => {
          const { label } = this.GENRES[genreId];

          this.game.addButton(
            this.game.format_string_recursive(_("${genre_icon}"), {
              genreId,
            }),
            () => {
              this.game.performAction("actAttachGenreStart", {
                cardsIds: selection
                  .map((card) => {
                    return Number(card.id);
                  })
                  .join(","),
                genreId: genreId,
              });
            },
            { title: _(label) }
          );
        });

        return;
      }

      if (selection.length > 2) {
        hand.unselectAll();
        return;
      }

      const cardId = Number(selection[0].id);

      this.game.addButton(
        _("place as new scene"),
        () => {
          this.game.performAction("actPlaceScene", {
            cardId: cardId,
          });
        },
        {
          disabled: !placeableScenes.includes(cardId),
        }
      );

      this.game.addButton(
        _("add to other scene"),
        () => {
          this.game.performAction("actAttachSceneStart", {
            cardId: cardId,
          });
        },
        { disabled: !attachableScenes.includes(cardId) }
      );

      this.game.addButton(
        this.game.format_string_recursive(
          _("discard and get 2 ${staff_icon}"),
          {}
        ),
        () => {
          this.game.performAction("actDiscardScene", {
            cardId: cardId,
          });
        },
        { type: "alert" }
      );
    };
  }

  private onInactiveUpdate(): void {
    this.onLeaving();
  }

  public onLeaving(): void {
    super.onLeaving();

    const { hand } = this.sceneManager.stocks;
    hand.setSelectionMode("none");
  }
}

interface ArgsPlayerTurn {
  nbr: number;
  canAttachGenre: boolean;
  placeableScenes: number[];
  attachableScenes: number[];
}

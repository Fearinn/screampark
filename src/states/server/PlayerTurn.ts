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

    const { keysToNumbers } = this.game;
    const { placeable, attachable, canAttachGenre, placeableAnywhere, nbr } =
      args;

    this.game.addButton(
      `<i class="fa6-solid fa6-backward-fast"></i>`,
      () => {
        this.game.performAction(
          "actResetTurn",
          {},
          { checkAction: false, checkPossibleActions: true }
        );
      },
      {
        id: "scp_resetTurnButton",
        type: "undo",
        disabled: nbr === 2,
        confirm: _("This will reset your latest turn"),
      }
    );

    this.game.addTooltipHtml(
      "scp_resetTurnButton",
      `<div class="scp_tooltip">
        <span>${_("reset your turn")}</span>
      </div>`
    );

    if (!this.game.isCurrentPlayerActive()) {
      this.onInactiveUpdate();
      return;
    }

    const { hand } = this.sceneManager.stocks;
    hand.setSelectionMode(canAttachGenre ? "multiple" : "single");

    hand.onSelectionChange = (selection, lastChange) => {
      this.game.clearButtons();

      this.game.statusBar.setTitle(
        _("${you} must draft a scene card (${nbr} left)"),
        {
          nbr,
        }
      );

      if (selection.length === 0) {
        return;
      }

      if (selection.length === 2) {
        this.game.statusBar.setTitle(
          _("${you} may discard both scenes to pick a genre card")
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
          disabled: !placeable.includes(cardId),
        }
      );

      this.game.addButton(
        _("add to another"),
        () => {
          this.game.performAction("actAttachSceneStart", {
            cardId: cardId,
          });
        },
        { disabled: !attachable.includes(cardId) }
      );

      this.game.addButton(
        this.game.format_string_recursive(
          _("place to the left (-1 ${staff_icon})"),
          {}
        ),
        () => {
          this.game.performAction("actPlaceAnywhereStart", {
            cardId: cardId,
          });
        },
        { disabled: !placeableAnywhere.includes(cardId) }
      );

      this.game.addButton(
        this.game.format_string_recursive(_("discard (+2 ${staff_icon})"), {}),
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
    const { hand } = this.sceneManager.stocks;
    hand.setSelectionMode("none");
  }

  public onLeaving(): void {
    super.onLeaving();
    this.onInactiveUpdate();

    document.getElementById("scp_undoActions").innerHTML = "";
  }
}

interface ArgsPlayerTurn {
  nbr: number;
  canAttachGenre: boolean;
  placeable: number[];
  attachable: number[];
  placeableAnywhere: number[];
}

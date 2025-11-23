class PlayerTurn extends State {
  private sceneManager: SceneManager;
  private SCENES: SCENE[];

  constructor(game: SCP) {
    super(game);
    this.sceneManager = new SceneManager(this.game);
    this.SCENES = this.game.gamedatas.SCENES;
  }

  public onUpdate(args: ArgsPlayerTurn): void {
    super.onUpdate(args);

    if (!this.game.isCurrentPlayerActive()) {
      this.onInactiveUpdate();
      return;
    }

    const { playableScenes, attachableScenes } = args;

    const { hand } = this.sceneManager.stocks;
    hand.setSelectionMode("multiple");

    hand.onSelectionChange = (selection, lastChange) => {
      this.game.clearButtons();

      if (selection.length === 0) {
        return;
      }

      if (selection.length === 2) {
        this.game.addButton(_("discard both and get a genre card"), () => {}, {
          type: "alert",
        });
        return;
      }

      if (selection.length > 2) {
        hand.unselectAll();
        return;
      }

      const cardId = Number(selection[0].id);

      this.game.addButton(
        _("play as new scene"),
        () => {
          this.game.performAction("actPlayScene", {
            cardId: cardId,
          });
        },
        {
          disabled: !playableScenes.includes(cardId),
        }
      );

      this.game.addButton(
        _("attach to other scene"),
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
  playableScenes: number[];
  attachableScenes: number[];
}

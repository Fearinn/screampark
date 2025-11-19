class PlayerTurn extends State {
  private sceneManager: SceneManager;
  private SCENES: SCENE[];

  constructor(game: SCP) {
    super(game);
    this.sceneManager = new SceneManager(this.game);
    this.SCENES = this.game.gamedatas.SCENES;
  }

  public onUpdate(args: ArgsPlayerTurn): void {
    if (!this.game.isCurrentPlayerActive()) {
      this.onInactiveUpdate();
      return;
    }

    const { playableScenes } = args;

    const { hand } = this.sceneManager.stocks;
    hand.setSelectionMode("multiple");

    hand.onSelectionChange = (selection, card) => {
      document.getElementById("generalactions").innerHTML = "";

      if (selection.length !== 1) {
        return;
      }

      const { id: cardId } = card;

      if (playableScenes.includes(cardId)) {
        this.game.addButton(_("play as new Scene"), () => {
          this.game.performAction("actPlayScene", {
            cardId: cardId,
          });
        });
      }
    };
  }

  private onInactiveUpdate(): void {
    this.onLeaving();
  }

  public onLeaving(): void {
    const { hand } = this.sceneManager.stocks;
    hand.setSelectionMode("none");
  }
}

interface ArgsPlayerTurn {
  playableScenes: number[];
}

class ChooseTheme extends State {
  private themeManager: ThemeManager;
  private THEMES: SCP_Gamedatas["THEMES"];

  constructor(game: SCP) {
    super(game);
    this.themeManager = new ThemeManager(this.game);
    this.THEMES = this.game.gamedatas.THEMES;
  }

  public onUpdate(args: ArgsChooseTheme): void {
    super.onUpdate(args);

    document.getElementById("scp_undoActions").innerHTML = "";

    if (!this.game.isCurrentPlayerActive()) {
      this.onInactiveUpdate();
      return;
    }

    const { player_id: playerId } = this.game;

    const { boards } = this.themeManager.stocks;
    const board = boards[playerId];

    board.setSelectionMode("single");
    board.onSelectionChange = (selection, card) => {
      this.game.clearButtons();

      if (selection.length === 0) {
        this.game.clearButtons();
        return;
      }

      const { id: cardId, type_arg: themeId } = card;
      const { label } = this.THEMES[themeId];

      this.game.addButton(
        this.game.format_string_recursive(_("keep ${themeLabel}"), {
          themeLabel: _(label),
        }),
        () => {
          this.game.performAction("actChooseTheme", {
            cardId: cardId,
          });
        }
      );
    };
  }

  private onInactiveUpdate(): void {
    this.onLeaving();

    this.game.addButton(
      `<i class="fa6 fa6-backward"></i>`,
      () => {
        this.game.performAction("actUndoChooseTheme", undefined, {
          checkAction: false,
          checkPossibleActions: true,
        });
      },
      { id: "scp_undoButton", type: "undo" }
    );

    this.game.addTooltipHtml(
      "scp_undoButton",
      `<div class="scp_tooltip">
        <span>${_("change Theme")}</span>
      </div>`
    );
  }

  public onLeaving(): void {
    super.onLeaving();

    const { player_id: playerId } = this.game;
    const { boards } = this.themeManager.stocks;
    boards[playerId].setSelectionMode("none");
  }
}

interface ArgsChooseTheme {}

class ChooseTheme extends State {
  private themeManager: ThemeManager;
  private THEMES: THEME[];

  constructor(game: SCP) {
    super(game);
    this.themeManager = new ThemeManager(this.game);
    this.THEMES = this.game.gamedatas.THEMES;
  }

  public onUpdate(): void {
    if (!this.game.isCurrentPlayerActive()) {
      this.onInactiveUpdate();
      return;
    }

    const { player_id: playerId } = this.game;

    const { boards } = this.themeManager.stocks;
    const board = boards[playerId];

    board.setSelectionMode("single");
    board.onSelectionChange = (selection, card) => {
      if (selection.length === 0) {
        this.game.removeConfirmation();
        return;
      }

      const { id: cardId, type_arg: themeId } = card;
      const { label } = this.THEMES[themeId];

      this.game.addConfirmation(
        this.game.format_string_recursive(_("keep ${theme_label}"), {
          theme_label: _(label),
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
      _("change mind"),
      () => {
        this.game.performAction("actUndoChooseTheme", undefined, {
          checkAction: false,
        });
      },
      { color: "secondary" }
    );
  }

  public onLeaving(): void {
    const { player_id: playerId } = this.game;
    const { boards } = this.themeManager.stocks;
    boards[playerId].setSelectionMode("none");
  }
}

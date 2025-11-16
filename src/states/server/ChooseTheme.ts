class ChooseTheme extends State {
  private themeManager: ThemeManager;
  private THEMES: THEME[];

  constructor(game: SCP) {
    super(game);
    this.themeManager = new ThemeManager(this.game);
    this.THEMES = this.game.gamedatas.THEMES;
  }

  public onUpdate(): void {
    const { player_id: playerId } = this.game;

    if (!this.game.isCurrentPlayerActive()) {
      this.onInactiveUpdate();
      return;
    }

    this.themeManager.setSelection(playerId, (selection, card) => {
      if (selection.length === 0) {
        this.game.removeConfirmation();
        return;
      }

      const { id: cardId, type_arg: themeId } = card;
      const { label } = this.THEMES[themeId];

      this.game.addConfirmation(
        this.game.format_string_recursive(_('keep "${theme_label}"'), {
          theme_label: _(label),
        }),
        () => {
          this.game.performAction("actChooseTheme", {
            cardId: cardId,
          });
        }
      );
    });
  }

  private onInactiveUpdate(): void {
    const { player_id: playerId } = this.game;
    this.themeManager.setSelection(playerId, null);
  }
}

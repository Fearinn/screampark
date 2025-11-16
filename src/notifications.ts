class NotifManager {
  private readonly game: SCP;
  private readonly themeManager: ThemeManager;

  constructor(game: SCP) {
    this.game = game;
    this.themeManager = new ThemeManager(this.game);
  }

  public async notif_chooseTheme(args: { player_id: number; cardId: number }) {
    const { player_id: playerId, cardId } = args;
    const { boards } = this.themeManager.stocks;
    const board = boards[playerId];

    await board.removeCard(
      { id: cardId },
      { fadeOut: true, slideTo: document.getElementById("player_boards") }
    );
  }
}

class VipManager {
  private readonly game: SCP;
  private stocks: VipStocks;
  private manager: BgaCards.Manager<SCP_Card>;

  constructor(game: SCP) {
    this.game = game;
    this.manager = this.game.managers.vips;
    this.stocks = this.game.stocks.vips;
  }

  public build(): void {
    const { managers } = this.game;
    const { animations } = managers;

    this.game.managers.vips = new BgaCards.Manager({
      animationManager: animations,
      type: "scp_vip",
      cardHeight: 286,
      cardWidth: 210,
      cardBorderRadius: "8px",
      setupDiv: (card, element) => {
        element.classList.add("scp_card");
      },
      setupFrontDiv: ({ type_arg: vip_id }, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/vip/VIP_${vip_id}.jpg)`;
      },
      setupBackDiv: (card, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/vip/VIP_0.jpg)`;
      },
    });

    this.game.stocks.vips = {
      board: new BgaCards.SlotStock(
        managers.vips,
        document.getElementById("scp_vips"),
        {
          slotsIds: [1, 2, 3],
          mapCardToSlot: (card) => {
            return Number(card.location_arg);
          },
          gap: "52px",
        }
      ),
    };
  }

  public setup(): void {
    const { vipCards } = this.game.gamedatas;
    const { board } = this.stocks;

    board.addCards(vipCards);
  }
}

interface VipCard extends SCP_Card {}

interface VipStocks {
  board: BgaCards.SlotStock<SCP_Card>;
}

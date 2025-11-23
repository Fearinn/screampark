class VipManager {
  private readonly game: SCP;
  private stocks: VipStocks;
  private manager: BgaCards.Manager<SCP_Card>;
  private VIPS: VIP[];

  constructor(game: SCP) {
    this.game = game;
    this.manager = this.game.managers.vips;
    this.stocks = this.game.stocks.vips;
    this.VIPS = this.game.gamedatas.VIPS;
  }

  private build(): void {
    const { managers } = this.game;
    const { animations } = managers;

    this.game.managers.vips = new BgaCards.Manager({
      animationManager: animations,
      type: "scp_vip",
      cardHeight: 286,
      cardWidth: 210,
      cardBorderRadius: "8px",
      setupDiv: ({ type_arg: vip_id }, element) => {
        element.classList.add("scp_card");

        const { label, description } = this.VIPS[vip_id];

        this.game.addTooltip(
          element.id,
          this.game.format_string_recursive(
            _("${vipLabel}: ${vip_description}"),
            {
              vipLabel: _(label),
              vip_description: {
                log: _(description),
                args: {},
              },
            }
          ),
          ""
        );
      },
      setupFrontDiv: ({ type_arg: vip_id }, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/vip/VIP_${vip_id}.jpg)`;
      },
      setupBackDiv: (card, element) => {
        element.style.backgroundImage = `url(${g_gamethemeurl}img/vip/VIP_0.jpg)`;
      },
    });
    this.manager = this.game.managers.vips;

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
          wrap: "nowrap",
        }
      ),
    };
    this.stocks = this.game.stocks.vips;
  }

  public setup(): void {
    this.build();

    const { vipCards } = this.game.gamedatas;
    const { board } = this.stocks;

    board.addCards(vipCards);
  }
}

interface VipCard extends SCP_Card {}

interface VIP {
  id: number;
  label: string;
  description: string;
}

interface VipStocks {
  board: BgaCards.SlotStock<SCP_Card>;
}

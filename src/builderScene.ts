import "phaser";
import { collectibleCards, tokenCards, Card } from "./catalog/catalog";
import { CardImage, addCardInfoToScene } from "./cardImage"
import { buttonStyle, filterButtonStyle, space } from "./settings"


// Load this from a json shared with python repo
const catalog = collectibleCards

var cardInfo: Phaser.GameObjects.Text


export class BuilderScene extends Phaser.Scene {
  catalogRegion
  deckRegion
  filterRegion

  constructor() {
    super({
      key: "BuilderScene"
    })
  }
  
  init(): void {
    this.deckRegion = new DeckRegion(this)
    this.catalogRegion = new CatalogRegion(this, this.deckRegion)
    this.filterRegion = new FilterRegion(this, this.catalogRegion)

    // let style = {
    //   font: '36px Arial Bold',
    //   color: '#d00',
    //   backgroundColor: '#88a',
    //   wordWrap: { width: 500, useAdvancedWrap: true }
    // };
    cardInfo = addCardInfoToScene(this)
  }

  preload(): void {
    this.load.setBaseURL(
      "https://raw.githubusercontent.com/KaiGeffen/" +
      "Celestial/master/images/");

    catalog.forEach( (card) => {
      this.load.image(card.name, `${card.name}.png`)
    })
    tokenCards.forEach( (card) => {
      this.load.image(card.name, `${card.name}.png`)
    })
  }
  
  create(): void {
    this.catalogRegion.create()
    this.deckRegion.create()
    this.filterRegion.create()
  }
}


class CatalogRegion {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  deckRegion
  cardImages: CardImage[] = []

  constructor(scene: Phaser.Scene, deckRegion) {
    this.init(scene, deckRegion);
  }

  init(scene, deckRegion): void {
    this.scene = scene;
    this.container = this.scene.add.container(0, 0);
    this.deckRegion = deckRegion;
  }

  create(): void {
    for (var i = catalog.length - 1; i >= 0; i--) {
      this.addCard(catalog[i], i);
    }
  }

  filter(filterFunction): void {
    this.cardImages.forEach( (cardImage) => {
      cardImage.image.setVisible(filterFunction(cardImage.card))
    })
  }

  private onClick(card: Card): () => void {
    return function() {
      this.deckRegion.addCard(card);
    }
  }

  private addCard(card: Card, index: number): void {
    var image: Phaser.GameObjects.Image;
    var [x, y] = this.getCardPosition(index);
    
    image = this.scene.add.image(x, y, card.name);
    image.setDisplaySize(100, 100);

    image.setInteractive();
    image.on('pointerdown', this.onClick(card), this);

    this.container.add(image);

    this.cardImages.push(new CardImage(card, image))
  }

  private getCardPosition(index: number): [number, number] {
    let col = index % space.cardsPerRow;
    let xPad = (1 + col) * space.pad;
    let x = col * space.cardSize + xPad + space.cardSize / 2;

    let row = Math.floor(index / space.cardsPerRow);
    let yPad = (1 + row) * space.pad;
    let y = row * space.cardSize + yPad + space.cardSize / 2;

    return [x, y];
  }
}


class DeckRegion {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  deck: CardImage[];
  btnStart: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.init(scene);
  }

  init(scene): void {
    this.scene = scene;
    this.container = this.scene.add.container(1000, 650);

    this.deck = [];
  }

  create(): void {
    // Sort button 
    let btnSort = this.scene.add.text(0, -125, 'Sort', buttonStyle);
    btnSort.setInteractive();

    let deckRegion = this;
    btnSort.on('pointerdown', function (event) {
      deckRegion.sort();
    })

    this.container.add(btnSort);

    // Start button
    this.btnStart = this.scene.add.text(0, -75, '', buttonStyle);

    this.btnStart.setInteractive();
    this.btnStart.on('pointerdown', function (event) {
      let deck: Card[] = deckRegion.deck.map( (cardImage) => cardImage.card)
      this.scene.scene.start("GameScene", {deck: deck})
    })
    
    this.updateStartButton();
    
    this.container.add(this.btnStart);
  }

  addCard(card: Card): void {
    if (this.deck.length >= 15) {
      this.scene.cameras.main.flash(300, 0, 0, 0.1);
      return;
    }

    let index = this.deck.length;
    var image: Phaser.GameObjects.Image;
    var [x, y] = this.getCardPosition(index);
    
    image = this.scene.add.image(x, y, card.name);
    image.setDisplaySize(100, 100);

    image.setInteractive();
    image.on('pointerdown', this.onClick(index), this);

    this.container.add(image);

    this.deck.push(new CardImage(card, image));

    this.updateStartButton();
  }

  private updateStartButton(): void {
    if (this.deck.length === 15) {
      this.btnStart.text = 'Start';
      this.btnStart.input.enabled = true;
    }
    else
    {
      this.btnStart.text = `${this.deck.length}/15`;
      this.btnStart.input.enabled = true; // TODO false
    }
  }

  private getCardPosition(index: number): [number, number] {
    let xPad = space.pad;
    let x = index * (space.cardSize - space.stackOverlap) + xPad + space.cardSize / 2;

    let y = space.pad + space.cardSize / 2 + (index % 2) * space.stackOffset;

    return [-x, -y];
  }

  private onClick(index: number): () => void {
    return function() {
      cardInfo.text = '';

      // Remove the image
      this.deck[index].destroy();

      // Remove from the deck array
      this.deck.splice(index, 1);

      this.correctDeckIndices();

      this.updateStartButton();
    }
  }

  // Set each card in deck to have the right position and onCLick events for its index
  private correctDeckIndices(): void {
    for (var i = 0; i < this.deck.length; i++) {
      let image = this.deck[i].image;

      image.setPosition(...this.getCardPosition(i));

      // Send to back
      this.container.bringToTop(image)

      // Remove the previous onclick event and add one with the updated index
      image.removeAllListeners('pointerdown');
      image.on('pointerdown', this.onClick(i), this);
    }
  }

  private sort(): void {
    this.deck.sort(function (card1, card2): number {
      if (card1.card.cost < card2.card.cost)
      {
        return -1;
      }
      else if (card1.card.cost > card2.card.cost)
      {
        return 1;
      }
      else
      {
        return card1.card.name.localeCompare(card2.card.name);
      }
    });

    this.correctDeckIndices();
  }
}


class FilterRegion {
  scene: Phaser.Scene
  container: Phaser.GameObjects.Container
  catalogRegion
  filter: boolean[] = []

  constructor(scene: Phaser.Scene, catalogRegion) {
    this.init(scene, catalogRegion);
  }

  init(scene, catalogRegion): void {
    this.scene = scene
    this.container = this.scene.add.container(1000, 20)
    this.catalogRegion = catalogRegion
  }

  create(): void {
    // Add each of the number buttons
    let btnNumbers: Phaser.GameObjects.Text[] = []
    for (var i = 0; i <= 8; i++) {
      this.filter[i] = false

      let y = 50 * (i + 1)
      let btn = this.scene.add.text(30, y, i.toString(), filterButtonStyle)
      
      btn.setInteractive()
      btn.on('pointerdown', this.onClick(i, btn))

      this.container.add(btn)

      btnNumbers.push(btn)
    }

    // Add the X (Clear) button
    let btnClear = this.scene.add.text(30, 0, 'x', filterButtonStyle)
    btnClear.setInteractive()
    btnClear.on('pointerdown', this.onClear(btnNumbers))
    this.container.add(btnClear)
  }

  private onClick(i: number, btn): () => void {
    let that = this

    return function() {
        // Highlight the button, or remove its Highlight
        if (btn.isTinted) {
          btn.clearTint()
        }
        else
        {
          btn.setTint(0xffaf00, 0xffaf00, 0xffaf00, 0xffaf00)
        }

        // Toggle filtering the chosen number
        that.filter[i] = !that.filter[i]

        // If nothing is filtered, all cards are shown
        let filterFunction
        if (that.filter.every(v => v === false)) {
          filterFunction = function (card: Card) {return true}
        }
        else
        {
          filterFunction = function (card: Card) {
            return that.filter[card.cost]
          }
        }

        that.catalogRegion.filter(filterFunction)
    }
  }

  private onClear(btns: Phaser.GameObjects.Text[]): () => void {
    let that = this
    return function() {
      btns.forEach( (btn) => btn.clearTint())

      for (var i = 0; i < that.filter.length; i++) {
        that.filter[i] = false
      }

      that.catalogRegion.filter(
        function (card: Card) {return true}
      )
    }
  }
}







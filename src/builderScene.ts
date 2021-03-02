import "phaser";
import { collectibleCards, Card } from "./catalog/catalog";

// Load this from a json shared with python repo
const catalog = collectibleCards;
// [
//   "Crossed Bones", "Spy", "Swift", "Sine",
//     "Fruiting", "Gift", "Desert", "Nightmare",
//     "AI"
// ];

const buttonStyle = {
      font: '36px Arial Bold',
      color: '#090'
    };

const space = {
  cardSize: 100,
  pad: 20,
  cardsPerRow: 8,
  stackOffset: 30,
  stackOverlap: 40
}

class CardImage {
  card: Card;
  image: Phaser.GameObjects.Image;

  constructor(card: Card, image: Phaser.GameObjects.Image) {
    this.init(card, image);
  }

  init(card: Card, image: Phaser.GameObjects.Image) {
    this.card = card;
    this.image = image;

    image.setInteractive();
    image.on('pointerover', this.onHover(), this);
    image.on('pointerout', this.onHoverExit(), this);
  }

  destroy(): void {
    this.image.destroy();
  }

  private onHover(): () => void {
    return function() {
      this.image.setTint(0xffff00);

      info.text = this.card.text;

      // Copy the position of the card in its local space
      let container = this.image.parentContainer;
      let x = this.image.x + container.x;
      let y = this.image.y + container.y;

      // Change alignment of text based on horizontal position on screen
      if (x <= info.width / 2) // Left
      {
        x = 0;
      }
      else if (x >= 1000 - info.width / 2) // Right side
      {
        x = 1000 - info.width;
      }
      else
      {
        x = x - info.width / 2;
      }

      if (y + info.height > 650) {
        y = 650 - info.height;
      }
      
      info.setX(x);
      info.setY(y);
    }
  }

  private onHoverExit(): () => void {
    return function() {
      this.image.clearTint();

      info.text = '';
    }
  }
}

var info: Phaser.GameObjects.Text;

export class BuilderScene extends Phaser.Scene {
  catalogRegion;
  deckRegion;

  constructor() {
    super({
      key: "BuilderScene"
    });
  }
  
  init(): void {
    this.deckRegion = new DeckRegion(this);
    this.catalogRegion = new CatalogRegion(this, this.deckRegion);

    let style = {
      font: '36px Arial Bold',
      color: '#d00',
      backgroundColor: '#88a',
      wordWrap: { width: 500, useAdvancedWrap: true }
    };
    info = this.add.text(10, 650, '', style);
    info.alpha = 0.9;
  }

  preload(): void {
    this.load.setBaseURL(
      "https://raw.githubusercontent.com/KaiGeffen/" +
      "Celestial/master/images/");

    catalog.forEach( (card) => {
      this.load.image(card.name, `${card.name}.png`)
    });
  }
  
  create(): void {
    this.catalogRegion.create();
    this.deckRegion.create();

    // // Add keyboard commands
    // this.input.keyboard.on('keydown-TAB', function (event) {
    //   console.log(this.deckRegion);
    //   // this.deckRegion.sort();
    // });
  }
}


class CatalogRegion {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  deckRegion;

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

    // TODO Use this maybe
    new CardImage(card, image);
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
      info.text = '';

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









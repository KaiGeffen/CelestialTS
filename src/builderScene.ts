import "phaser";
import { collectibleCards, Card } from "./catalog/catalog";
import { io } from "socket.io-client";

// Load this from a json shared with python repo
const catalog = collectibleCards;
// [
//   "Crossed Bones", "Spy", "Swift", "Sine",
//     "Fruiting", "Gift", "Desert", "Nightmare",
//     "AI"
// ];

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
    this.catalogRegion.create()
  }
};


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
};


class DeckRegion {
  scene: Phaser.Scene;
  container: Phaser.GameObjects.Container;
  deck: CardImage[];

  constructor(scene: Phaser.Scene) {
    this.init(scene);
  }

  init(scene): void {
    this.scene = scene;
    this.container = this.scene.add.container(1000, 650);

    this.deck = [];
  }

  update(time: number): void {
    if (this.scene.input.keyboard.addKey('A').isDown) {
      console.log('fff');
      this.sort();
    }
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
    }
  }

  // Set each card in deck to have the right position and onCLick events for its index
  private correctDeckIndices(): void {
    for (var i = this.deck.length - 1; i >= 0; i--) {
      this.deck[i].image.setPosition(...this.getCardPosition(i));

      // Remove the previous onclick event and add one with the updated index
      this.deck[i].image.removeAllListeners('pointerdown');
      this.deck[i].image.on('pointerdown', this.onClick(i), this);
    }
  }

  private sort(): void {
    this.deck.sort();
    this.correctDeckIndices();
  }
}












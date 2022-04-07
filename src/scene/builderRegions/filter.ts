import 'phaser'

import { Color } from "../../settings/settings"
import Card from '../../lib/card'
import { CardImage } from '../../lib/cardImage'
import { Style, UserSettings, Space, Mechanics } from "../../settings/settings"
import { TextButton } from '../../lib/buttons/text'
import { UButton } from '../../lib/buttons/underlined'
import { IButtonX } from '../../lib/buttons/icon'


// Filter region of the deck builder scene
class FilterRegion {  
	// Overwrite the 'scene' property of container to specifically be a BuilderScene
	scene// TODO: BuilderSceneShell

	// Full list of all cards in the catalog (Even those invisible)
	cardCatalog: CardImage[]

	// The costs and string that cards in the catalog are filtered for
	filterCostAry: boolean[] = []
	searchText: string = ""
	filterUnowned: boolean

	// Create this region, offset by the given width
	create(scene, x: number) { // TODO scene is BaseScene
		let that = this
		let container = scene.add.container().setDepth(2)

		this.createBackground(container)

		let backButton = new TextButton(container, Space.pad, 40, '<   Back', this.scene.doExit()).setOrigin(0, 0.5)
		container.add(backButton)

		this.createFilterButtons(container)

		this.createTextSearch(container)
	}

	private createBackground(container: Phaser.GameObjects.Container) {
		let background = container.scene.add.image(0, 0, 'icon-Search')
		.setOrigin(0) // TODO 80 Search height
		.setInteractive(new Phaser.Geom.Rectangle(0, 0, Space.windowWidth, 80), Phaser.Geom.Rectangle.Contains)

		container.add(background)
	}

	private createFilterButtons(container: Phaser.GameObjects.Container) {
		let scene = container.scene

		// Cost filters
		container.add(scene.add.text(645, 40, 'Cost:', Style.builder).setOrigin(1, 0.5))

		let btns = []
		for (let i = 0; i <= 7; i++) {
			let s = i === 7 ? '7+' : i.toString()
			let btn = new UButton(container, 670 + i * 41, 40, s)
			btn.setOnClick(this.onClickFilterButton(i, btns))

			btns.push(btn)
		}
		let btnX = new IButtonX(container, 1000, 40, this.onClearFilters(btns))
	}

	private createTextSearch(container: Phaser.GameObjects.Container) {
		let scene = container.scene

		let textboxSearch = scene.add['rexInputText'](
			215, 40, 308, 40, {
				type: 'text',
				text: this.searchText,
				placeholder: 'Search',
				tooltip: 'Search for cards by text.',
				fontFamily: 'Mulish',
				fontSize: '20px',
				color: Color.textboxText,
				maxLength: 40,
				selectAll: true,
				id: 'search-field'
			})
		.on('textchange', function(inputText) {
			// Filter the visible cards based on the text
			this.searchText = inputText.text
			scene['filter']() // TODO Smell
		}, this)
		.setOrigin(0, 0.5)

		container.add(textboxSearch)
	}

	private onClickFilterButton(thisI: number, btns: UButton[]): () => void {
      let that = this

      return function() {
        // Clear out all buttons
        for (let i = 0; i < btns.length; i++) {
          // Toggle this one, clear all others
          if (i === thisI) {
            btns[i].toggle()
            that.filterCostAry[i] = !that.filterCostAry[i]
          }
          else {
            btns[i].toggleOff()
            that.filterCostAry[i] = false
          }
        }

        that.filter()
      }
    }

    private onClearFilters(btns: UButton[]): () => void {
      let that = this

      return function() {
        for (let i = 0; i < btns.length; i++) {
          btns[i].toggleOff()
          that.filterCostAry[i] = false
        }

        that.filter()
      }
    }





	// TODO Move
	// Filter which cards can be selected in the catalog based on current filtering parameters
	filter(): void {
		let filterFunction: (card: Card) => boolean = this.getFilterFunction()
		let sizer = this.panel.getElement('panel')
		sizer.clear()

		let cardCount = 0
		for (var i = 0; i < this.cardCatalog.length; i++) {

			// The first card on each line should have padding from the left side
			// This is done here instead of in padding options so that stats text doesn't overflow 
			let leftPadding = 0
			if (cardCount % this.cardsPerRow === 0) {
				leftPadding = Space.pad
			}

			let cardImage = this.cardCatalog[i]

			// Check if this card is present
			if (filterFunction(cardImage.card)) {
				cardCount++

				cardImage.image.setVisible(true)

				// Add the image next, with padding between it and the next card
				sizer.add(cardImage.image, {
					padding: {
						right: Space.pad - 2
					}
				})

			}
			else
			{
				cardImage.image.setVisible(false)
				cardImage.txtStats.setVisible(false)
			}
		}

		this.panel.layout()

		// Hide the slider if all cards fit in panel
		let slider = this.panel.getElement('slider')

		// Taken from['RexUI'] implementation of overflow for scrollable panel
		let isOverflow = function(panel: any): boolean {
			let t = panel.childrenMap.child
			return t.topChildOY!==t.bottomChildOY;
		}

		if (!isOverflow(this.panel)) {
			slider.setVisible(false)
		} else {
			slider.setVisible(true)
		}

		// Resize each stats text back to original size
		this.cardCatalog.forEach((cardImage) => {
			cardImage.txtStats.setSize(100, 100)

			// Move up to be atop image
			cardImage.txtStats.setDepth(1)
		})
	}





	private addCardToCatalog(card: Card, index: number): CardImage {
		let cardImage = new CardImage(card, this)
		.setOnClick(this.onClickCatalogCard(card))

		// Add this cardImage to the maintained list of cardImages in the catalog
		this.cardCatalog.push(cardImage)

		return cardImage
	}

	// Event when a card in the catalog is clicked
	private onClickCatalogCard(card: Card): () => void {
		let scene = this.scene

		return function() {
			if (scene.addCardToDeck(card)) {
				scene.sound.play('click')
			}
			else {
				scene.signalError('Deck is full')
			}
		}
	}






	// TODO Move
	// Returns a function which filters cards to see which are selectable
	private getFilterFunction(): (card: Card) => boolean {
		let that = this

		// Filter cards based on their cost
		let costFilter = function(card: Card): boolean {
			// If no number are selected, all cards are fine
			if (!that.filterCostAry.includes(true)) {
				return true
			}
			else {
				// The last filtered cost includes everything more than it
				return that.filterCostAry[Math.min(card.cost, maxCostFilter)]
			}
		}

		// Filter cards based on if they contain the string being searched
		let searchTextFilter = function(card: Card): boolean {
			// If searching for 'common', return false to uncommon cards
			if (that.searchText.toLowerCase() === 'common' && card.getCardText().toLowerCase().includes('uncommon')) {
				return false
			}
			return (card.getCardText()).toLowerCase().includes(that.searchText.toLowerCase())
		}

		// Filter cards based on whether you have unlocked them
		let ownershipFilter = function(card: Card): boolean {
			return !that.filterUnowned || UserSettings._get('inventory')[card.id]
		}

		// Filter based on the overlap of all above filters
		let andFilter = function(card: Card): boolean {
			return costFilter(card) && searchTextFilter(card) && ownershipFilter(card)
		}

		return andFilter
	}
}
import 'phaser'

import ContainerLite from 'phaser3-rex-plugins/plugins/containerlite.js';

import { Space, Style, Color, UserSettings } from "../../settings/settings"
import Button from '../../lib/buttons/button'
import { IButtonPremade } from '../../lib/buttons/icon'
import { ButtonNewDeck } from '../../lib/buttons/backed'
import { ButtonDecklist } from '../../lib/buttons/decklist'


// Region of the deck builder which contains all the decklists
export default class DecklistsRegion {  
  scene

  deckPanel
  width: number

  // The index of the currently selected deck
  savedDeckIndex: number

  // List of buttons for user-defined decks
  decklistBtns: Button[]

  // Image of the current avatar
  avatar: Phaser.GameObjects.Image

  // Create the are where player can manipulate their decks
  create(scene) {
  	this.scene = scene

    let deckPanel = this.deckPanel = this.createDeckpanel()

    let panel = deckPanel.getElement('panel')

    // Update panel when mousewheel scrolls
    this.updateOnScroll(panel)

    // Add a NEW button
    panel['add'](this.createNewButton(panel))

    // Add each of the decks
    this.createDeckButtons(panel)

    this.deckPanel.layout()

    this.width = this.deckPanel.width

    return this
  }

  // TODO
  // Update the currently selected deck
  updateSavedDeck(): void {
    let index = this.savedDeckIndex
    if (index !== undefined) {
      let deck = UserSettings._get('decks')[index]
      let name = deck['name']
      let deckCode = this.scene.getDeckCode()

      let newDeck = {
        name: name,
        value: deckCode,
        avatar: deck['avatar']
      }

      UserSettings._setIndex('decks', index, newDeck)
    }
  }

  // Create and return the scrollable panel where premade decks go
  private createDeckpanel() { // TODO Return type
    const width = Space.iconSeparation + Space.pad

    let background = this.scene.add.rectangle(0, 0, width, Space.windowHeight, 0xFFFFFF).setInteractive()

    let panel = this.scene.rexUI.add.scrollablePanel({
      x: 0,
      y: 0,
      width: width,
      height: Space.windowHeight,

      background: background,

      panel: {// TODO Create panel method
        child: this.scene.rexUI.add.fixWidthSizer({space: {
          left: Space.pad,
          right: Space.pad,
          top: 10,
          bottom: 10,
          line: 10,
        }}).addBackground(
        	this.scene.add.rectangle(0, 0, width, Space.windowHeight, 0xFFFFFF)
        )
      },

      header: this.createHeader(),

      space: {
        right: 10,
        // bottom: Space.pad,
      }
    }).setOrigin(0)

    this.scene.plugins.get('rexDropShadowPipeline')['add'](background, {
      distance: 3,
      shadowColor: 0x000000,
    })

    return panel
  }

  private createHeader(): Phaser.GameObjects.GameObject {
    let sizer = this.scene.rexUI.add.fixWidthSizer({
      space: {
        left: Space.pad,
        right: Space.pad,
        top: 90,
        bottom: Space.pad,
        line: Space.pad,
      }
    })

    this.avatar = this.scene.add.image(0, 0, 'avatar-Jules')
    sizer.add(this.avatar, {padding:{left: 35}})

    // TODO Make this constant and use throughout?
    let callback = this.premadeCallback()
    let btn = new IButtonPremade(this.scene, 0, 0,
      () => {
        // TODO Hand this to a class instead of calling ourselves
        this.scene.scene.launch('MenuScene', {
          menu: 'choosePremade',
          callback: callback
        })
      }
      ).setOrigin(0, 0.5)
    sizer.add(btn.icon)

    let line = this.scene.add.line(0, 0, 0, 0, Space.iconSeparation + Space.pad, 0, Color.line)
    sizer.add(line)

    let txtHint = this.scene.add.text(0, 0, 'My Decks:', Style.header)
    sizer.add(txtHint)

    return sizer
  }

  // TODO Callback for when a premade avatar is clicked on
  private premadeCallback(): (i: number) => () => void {
    let that = this
    return function(i: number) {
      return function() {
        that.savedDeckIndex = undefined
        console.log(i)
      }
    }
  }

  // Update the panel when user scrolls with their mouse wheel
  private updateOnScroll(panel) {
    let that = this

    this.scene.input.on('wheel', function(pointer: Phaser.Input.Pointer, gameObject, dx, dy, dz, event) {
      // Return if the pointer is outside of the panel
      if (!panel.getBounds().contains(pointer.x, pointer.y)) {
        return
      }

      // Scroll panel down by amount wheel moved
      that.deckPanel.childOY -= dy

      // Ensure that panel isn't out bounds (Below 0% or above 100% scroll)
      that.deckPanel.t = Math.max(0, that.deckPanel.t)
      that.deckPanel.t = Math.min(0.999999, that.deckPanel.t)
    })
  }

  // Create a button for a new user-made deck at the given index
  // Add it to the list of deck buttons, and return it
  private createDeckBtn(i: number): ContainerLite {
    let deck = UserSettings._get('decks')[i]

    let name = deck === undefined ? '' : deck['name']

    let container = new ContainerLite(this.scene, 0, 0, 200, 50)
    let btn = new ButtonDecklist(container, 0, 0, name, () => {}, this.deleteDeck(i, container))

    // // Highlight this deck, if it's selected
    // if (this.savedDeckIndex === i) {
      //     // So that layout happens correctly
      //     setTimeout(() => btn.select(), 4)
      //   }

      // Set as active, select self and deselect other buttons, set the deck
      let that = this
      btn.setOnClick(function() {
        // Deselect all other buttons
        that.decklistBtns.forEach(b => {if (b !== btn) b.deselect()})

        // If it's already selected, deselect it
        if (btn.selected) {
          that.savedDeckIndex = undefined
          that.scene.setDeck([])
          btn.deselect()
        }
        // Otherwise select this button
        else {
          that.savedDeckIndex = i
          btn.select()

          that.scene.setDeck(UserSettings._get('decks')[i]['value'])

          // Set the displayed avatar to this deck's avatar
          that.setAvatar(UserSettings._get('decks')[i]['avatar'])
        }
      })

      this.decklistBtns.push(btn)

      return container
    }

    // Create a button for each deck that user has created
    private createDeckButtons(panel) {
      // Instantiate list of deck buttons
      this.decklistBtns = []

      // Create the preexisting decks
      for (var i = 0; i < UserSettings._get('decks').length; i++) {
        panel.add(this.createDeckBtn(i))
      }
    }

    // Create the "New" button which prompts user to make a new deck
    private createNewButton(panel): ContainerLite {
      let that = this
      let scene = this.scene

      // Callback for when 'Create' is hit in the menu
      function createCallback(name: string, avatar: number): void {
        // Create the deck in storage
        UserSettings._push('decks', {
          name: name,
          value: scene.getDeckCode(),
          avatar: avatar,
        })

        // Create a new button
        let newBtn = that.createDeckBtn(that.decklistBtns.length)
        panel.add(newBtn)
        that.deckPanel.layout()

        // Select that deck
        let index = that.decklistBtns.length - 1
        that.decklistBtns[index].onClick()

        // Scroll down to show the new deck
        that.deckPanel.t = 1
      }

      const maxDecks = 20
      function openNewDeckMenuCallback() {
        // If user already has 9 decks, signal error instead
        if (UserSettings._get('decks').length >= maxDecks) {
          scene.signalError(`Reached max number of decks (${maxDecks}).`)
        }
        else {
          scene.scene.launch('MenuScene', {
            menu: 'newDeck',
            callback: createCallback,
          })
        }
      }

      // TODO Width and height constants
      let container = new ContainerLite(this.scene, 0, 0, 200, 50)

      let btn = new ButtonNewDeck(container, 0, 0, 'New Deck', openNewDeckMenuCallback)

      return container
    }

    // Callback for deleting deck with given index
    private deleteDeck(i: number, container: ContainerLite): () => void {
      let that = this

      return function() {
        // Adjusted the saved user data
        UserSettings._pop('decks', i)

        // Adjust values stored in this deck region
        that.decklistBtns.splice(i)
        that.savedDeckIndex = undefined
        that.scene.setDeck([])

        // Destroy the object itself
        container.destroy()

        // Format panel, then ensure we aren't below the panel
        that.deckPanel.layout()
        that.deckPanel.t = Math.min(1, that.deckPanel.t)
      }
    }

    // Create the "Code" button which prompts user to copy/paste a deck-code
    private createCodeButton(panel, footer) {
      let that = this
      // footer.add(
      //   new Button(this.scene, 0, 0, 'CODE', function() {
        //     that.createNewCodeMenu()
        //   }).txt)
      }

      // Create a new deck menu naming a new deck, pass in that deck's button to update text dynamically
      private createNewDeckMenu(btn: Button, panel): void {
        let scene = this.scene
        let height = 250

        let menu = new Menu(
          scene,
          450,
          height,
          true,
          20)

        let txtTitle = scene.add.text(0, -height/2, 'Deck Name:', Style.announcement).setOrigin(0.5, 0)
        menu.add(txtTitle)

        let textArea = scene.add['rexInputText'](
          0, 0, 350, Space.textAreaHeight, {
            type: 'text',
            text: '',
            placeholder: 'Name',
            tooltip: 'The name for your new deck.',
            fontFamily: 'Mulish',
            fontSize: '60px',
            color: Color.button,
            align: Phaser.Display.Align.BOTTOM_RIGHT,
            border: 3,
            borderColor: '#000',
            backgroundColor: Color.textAreaBackground,
            maxLength: 8,
            selectAll: true,
            id: 'search-field'
          })
        .on('textchange', function(inputText) {
          btn.setText(inputText.text)
        }, scene)
        menu.add(textArea)

        // When menu is exited, add the deck to saved decks
        let that = this
        menu.setOnClose(function() {
          let name = textArea.text

          // If name is not empty, add it to the list of decks
          if (name !== '') {
            UserSettings._push('decks', {name: name, value: scene.getDeckCode()})
            // btn.emit('pointerdown')
          } else {
            // Destroy the panel and recreate it
            // NOTE Panel is the sizer containing the deck buttons
            panel.destroy()
            that.deckPanel.destroy()
            that.create()
          }

          menu.destroy()
        })
      }

      // Create a new code menu which shows the current decks code, and allows for pasting in a new code
      private createNewCodeMenu(): void {
        let scene = this.scene
        let that = this
        let height = 250
        let width = 600

        let menu = new Menu(
          scene,
          width,
          height,
          true,
          20)

        let txtTitle = scene.add.text(0, -height / 2, 'Deck Code:', Style.announcement).setOrigin(0.5, 0)
        menu.add(txtTitle)

        let textArea = scene.add['rexInputText'](
          0, 0, width - Space.pad * 2, Space.textAreaHeight, {
            type: 'text',
            text: scene.getDeckCode(),
            placeholder: '',
            tooltip: "Copy the code for your current deck, or paste in another deck's code to create that deck.",
            fontFamily: 'Mulish',
            fontSize: '60px',
            color: Color.button,
            align: Phaser.Display.Align.BOTTOM_RIGHT,
            border: 3,
            borderColor: '#000',
            backgroundColor: Color.textAreaBackground,
            maxLength: 4 * Mechanics.deckSize,
            selectAll: true,
            id: 'search-field'
          })
        .on('textchange', function(inputText) {
          scene.setDeck(inputText.text)
        })
        menu.add(textArea)

        // When menu is exited, destroy this menu
        menu.setOnClose(function() {
          if (!scene.setDeck(textArea.text)) {
            scene.signalError('Deck code invalid.')
          }
          menu.destroy()
        })
      }

      // Change the displayed avatar to the given avatar
      private setAvatar(id: number) {
        // TODO Require all decks to have an avatar
        id = id === undefined ? 0 : id

        this.avatar.setTexture(`avatar-${avatarNames[id]}`)
      }
}
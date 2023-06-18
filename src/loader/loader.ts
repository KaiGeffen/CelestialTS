import avatarNames from '../lib/avatarNames'
import { allCards, collectibleCards } from '../catalog/catalog'

// Json data
import avatarData from './avatars.json'
import iconData from './icons.json'
import backgroundData from './backgrounds.json'
import keywordData from './keywords.json'
import storyData from './stories.json'
import sfxData from './sfx.json'
import voiceData from './voice.json'
import { Space, Flags } from '../settings/settings'


const EXTENSION = 'webp'

// Entry in the prefix map below
interface PrefixEntry {
	fp: string,
	prefix: string,
	list: string[],
}

const prefixMap: PrefixEntry[] = [
	{
		fp: 'avatars/',
		prefix: 'avatar-',
		list: avatarData,
	},
	{
		fp: Flags.mobile ? 'cards/mobile/' : 'cards/',
		prefix: '',
		list: allCards.map((card) => card.name),
	},
	{
		fp: 'cutouts/',
		prefix: 'cutout-',
		list: collectibleCards.map((card) => card.name),
	},
	{
		fp: 'icons/',
		prefix: 'icon-',
		list: iconData,
	},
	{
		fp: 'keywords/',
		prefix: 'kw-',
		list: keywordData,
	},
	{
		fp: 'backgrounds/',
		prefix: 'bg-',
		list: backgroundData,
	},
	{
		fp: 'story/',
		prefix: 'story-',
		list: storyData,
	},
]


export default class Loader {
	// Load any assets that are needed within the preload scene
	static preload(scene: Phaser.Scene) {
		// Set the load path
		scene.load.path = 'assets/'

		// Load button as a spritesheet
		Loader.loadButton(scene)
	}

	static loadAll(scene: Phaser.Scene) {
		// Set the load path
		scene.load.path = 'assets/'

		// Load the avatars as a spritesheet
		Loader.loadAvatarPortraits(scene)

		// Load all audio
		Loader.loadAudio(scene)

		// Load the videos
		Loader.loadVideos(scene)

		// Load the round results
		Loader.loadResults(scene)

		// Load the mission icon 2-frame
		Loader.loadMissionIcon(scene)

		// Load the rest of the assets
		Loader.bulkLoad(scene)

		scene.load.start()

		// After loading is complete, do anything that relies on the loaded resources
		scene.load.on('complete', () => {
			// Generate the animations for a match results
			Loader.loadAnimations(scene)
		})
	}

	static loadAnimations(scene: Phaser.Scene): void {
		['Win', 'Lose', 'Tie'].forEach(s => {
			const name = `icon-Round${s}`

			scene.anims.create({
				key: name,
				frameRate: 2,
				frames: scene.anims.generateFrameNumbers(name, { start: 0, end: 3 }),
			})
		})
	}

	// Load all of the assets that load in a normal way
	private static bulkLoad(scene: Phaser.Scene): void {
		// For each type of asset
		prefixMap.forEach((assetType: PrefixEntry) => {

			// For each asset of that type
			assetType.list.forEach((name) => {
				scene.load.image(`${assetType.prefix}${name}`, `${assetType.fp}${name}.${EXTENSION}`)
			})
		})
	}

	// Loads the avatar portraits which are spritesheets
	private static loadAvatarPortraits(scene: Phaser.Scene): void {
		avatarNames.forEach((name) => {
			// Load the spritesheet with basic + emotes
			scene.load.spritesheet(`avatar-${name}`, `avatars/${name}.${EXTENSION}`, {
				frameWidth: Space.avatarSize,
				frameHeight: Space.avatarSize,
			})
		})
	}

	// Loads the avatar portraits which are spritesheets
	private static loadMissionIcon(scene: Phaser.Scene): void {
		// Load the spritesheet with basic + emotes
		scene.load.spritesheet(`icon-Mission`, `icons/Mission.${EXTENSION}`, {
			frameWidth: 80,
			frameHeight: 80,
		})
	}

	// Loads the basic button as a spritesheet
	private static loadButton(scene: Phaser.Scene): void {
		scene.load.spritesheet(`icon-Button`, `icons/Button.${EXTENSION}`, {
			frameWidth: Space.buttonWidth,
			frameHeight: Space.buttonHeight,
		})
	}

	// Loads all audio
	private static loadAudio(scene: Phaser.Scene): void {
		// Load all sfx
		sfxData.forEach((sound) => {
			scene.load.audio(sound, `sfx/${sound}.mp3`)
		})

		// Load each characters voice clip
		voiceData.forEach((name) => {
			scene.load.audio(`voice-${name}`, `voice/${name}.mp3`)
		})
	}

	// Loads all video textures
	private static loadVideos(scene: Phaser.Scene): void {
		// scene.load.video('priorityHighlight', 'priority.mp4')
	}

	// Load the round result animations
	private static loadResults(scene: Phaser.Scene): void {
		['Win', 'Lose', 'Tie'].forEach(s => {
			const name = `icon-Round${s}`

			scene.load.spritesheet(name, `icons/Round${s}.${EXTENSION}`, {
				frameWidth: 563,
				frameHeight: 258,
			})
		})
	}
}
